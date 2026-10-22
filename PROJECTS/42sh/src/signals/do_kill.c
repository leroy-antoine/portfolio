/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** do_kill
*/

#include <signal.h>
#include <string.h>
#include <unistd.h>
#include "my.h"
#include "mysh.h"

static void print_success_message(long int id, char **command)
{
    dprintf(STDOUT_FILENO, "Successfully killed job [%ld]. Was : ", id);
    if (command != NULL) {
        for (size_t i = 0; command[i] != NULL; ++i)
            dprintf(STDOUT_FILENO, "%s ", command[i]);
    }
    dprintf(STDOUT_FILENO, ".\n");
}

static void print_and_stop(char **command, pid_t pid, long int id, bool all)
{
    if (!all)
        print_success_message(id, command);
    kill(pid, SIGTERM);
}

static int kill_first_elem(system_t *sys, jobs_t *data, bool all)
{
    print_and_stop(data->command_line, data->pid, data->ID, all);
    kick_out_list(sys);
    return EPI_SUCCESS;
}

static int kill_usage(void)
{
    dprintf(STDERR_FILENO, "To use kill, type :\n"
            "[jkill ID], where ID is the ID of the process you want to kill.\n"
            "Type [jobs] to see the processes that are "
            "currently running and their IDs.\n"
            "To kill all the processes that are "
            "currently running on this shell, type : \n"
            "[jkill all]\n");
    return EPI_ERROR;
}

static int kill_every_process(linked_list_t *job)
{
    node_t *next = job->head;
    jobs_t *data = NULL;
    long int nb_jobs = 0;

    if (next == NULL)
        return kill_usage();
    while (job->head != NULL) {
        ++nb_jobs;
        next = job->head->next;
        data = job->head->data;
        print_and_stop(data->command_line, data->pid, data->ID, true);
        delete_node(job, job->head, free_jobs);
        job->head = next;
    }
    dprintf(STDOUT_FILENO, "Successfully killed %ld jobs.\n", nb_jobs);
    return EPI_SUCCESS;
}

static int kill_proper_process(long int id, linked_list_t *jobs, system_t *sys)
{
    jobs_t *data = NULL;
    node_t *head = jobs->head;

    if (head == NULL || head->data == NULL)
        return kill_usage();
    data = jobs->head->data;
    if (id == data->ID)
        return kill_first_elem(sys, data, false);
    while (head != NULL && data->ID != id) {
        if (head->next != NULL)
            data = head->next->data;
        if (head->next != NULL && data->ID == id) {
            print_and_stop(data->command_line, data->pid, data->ID, false);
            delete_node(jobs, head->next, free_jobs);
            return EPI_SUCCESS;
        }
        head = head->next;
    }
    return kill_usage();
}

int do_kill(char **args, system_t *sys)
{
    long int id = 0;
    char *endptr = NULL;

    if (sys == NULL || sys->jobs == NULL) {
        dprintf(STDERR_FILENO, "ERROR : no jobs are currently running\n");
        return EPI_ERROR;
    }
    if (my_list_len(args) != 2)
        return kill_usage();
    if (strcmp(args[1], "all") == 0)
        return kill_every_process(sys->jobs);
    id = strtol(args[1], &endptr, DECIMAL_BASE);
    if (id == 0)
        return kill_usage();
    return kill_proper_process(id, sys->jobs, sys);
}
