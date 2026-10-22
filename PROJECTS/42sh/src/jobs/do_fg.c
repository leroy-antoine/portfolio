/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** do_fg
*/

#include <fcntl.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include "my.h"
#include "mysh.h"

void kick_out_list(system_t *sys)
{
    node_t *tmp = NULL;

    if (sys->jobs == NULL)
        return;
    tmp = sys->jobs->head;
    if (tmp != NULL)
        tmp = tmp->next;
    free_jobs(sys->jobs->head->data);
    sys->jobs->head = tmp;
}

static bool check_fg(system_t *sys, char **commands)
{
    if (sys == NULL || commands == NULL)
        return true;
    if ((sys->jobs->head) == NULL) {
        dprintf(STDERR_FILENO, "fg: No current job.\n");
        return true;
    }
    if (sys->jobs->head->data == NULL) {
        dprintf(STDERR_FILENO, "fg: No current job.\n");
        return true;
    }
    if (array_len(commands) != 1 && strcmp(commands[0], "fg") != 0) {
        dprintf(STDERR_FILENO, "fg: Wrong usage of fg\n");
        return true;
    }
    return false;
}

static void print_fg_message(char **command_line)
{
    if (command_line == NULL) {
    dprintf(STDERR_FILENO, "ERROR : NULL COMMAND LINE\n");
    return;
    }
    for (size_t i = 0; command_line[i] != NULL; i++)
        dprintf(STDOUT_FILENO, "%s ", command_line[i]);
    dprintf(STDOUT_FILENO, "\n");
}

static void continue_job(system_t *sys, pid_t pid, char **command_line)
{
    int status = 0;

    kill(pid, SIGCONT);
    waitpid(pid, &status, WUNTRACED);
    if (is_signal()->is_ctrl_z) {
        is_signal()->is_ctrl_z = false;
        do_ctrl_z(sys, command_line, pid, &status);
    }
    print_fg_message(command_line);
}

static void continue_proper_pid(pid_t id, linked_list_t *jobs, long int ID,
    system_t *sys)
{
    node_t *tmp = jobs->head;
    jobs_t *data = jobs->head->data;

    if (ID == data->ID) {
        continue_job(sys, id, data->command_line);
        return kick_out_list(sys);
    }
    while (tmp != NULL) {
        data = tmp->next->data;
        if (tmp->next != NULL && data->ID == ID) {
            continue_job(sys, data->pid, data->command_line);
            free_jobs(tmp->next->data);
            tmp->next = tmp->next->next;
            return;
        }
        tmp = tmp->next;
    }
}

static void push_id_to_front(system_t *sys, char **command)
{
    char *endptr = NULL;
    node_t *tmp = sys->jobs->head;
    jobs_t *data = tmp->data;
    long int num = 0;

    num = strtol(command[1], &endptr, DECIMAL_BASE);
    if (*endptr != '\0') {
        dprintf(STDERR_FILENO, "fg: No such job.\n");
        return;
    }
    while (tmp != NULL) {
        if (data->ID == num)
            return continue_proper_pid(data->pid,
                sys->jobs, num, sys);
        tmp = tmp->next;
        if (tmp != NULL)
            data = tmp->data;
    }
    dprintf(STDERR_FILENO, "fg: No such job.\n");
}

void do_fg(system_t *sys, char **command_line)
{
    jobs_t *data = NULL;

    if (check_fg(sys, command_line))
        return;
    if (array_len(command_line) == 2 && strcmp(command_line[0], "fg") == 0)
        return push_id_to_front(sys, command_line);
    data = sys->jobs->head->data;
    continue_job(sys, data->pid, data->command_line);
    kick_out_list(sys);
}
