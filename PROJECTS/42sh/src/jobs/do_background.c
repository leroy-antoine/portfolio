/*
** EPITECH PROJECT, 2025
** 42_sh_private
** File description:
** do_background
*/


#include <fcntl.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/wait.h>
#include "my.h"
#include "mysh.h"

static ssize_t find_delim(char **command)
{
    int index = 0;

    while (command[index] != NULL) {
        if (strcmp(command[index], BACKGROUND_JOB) == 0)
            return index;
        index++;
    }
    return index;
}

void fill_jobs_infos(linked_list_t *jobs, pid_t pid,
    char **command)
{
    jobs_t *new_job = NULL;
    static int id = 0;

    id += 1;
    new_job = malloc(sizeof(jobs_t));
    if (new_job == NULL) {
        jobs->head = NULL;
        return;
    }
    new_job->command_line = copy_arr(command);
    if (new_job->command_line == NULL) {
        jobs->head = NULL;
        return;
    }
    new_job->pid = pid;
    new_job->ID = id;
    push_to_head(jobs, new_job);
}

static void put_on_background(system_t *sys, char **new_command)
{
    char **env_list = env_to_list(sys->env);

    if (env_list == NULL)
        return;
    signal(SIGTSTP, SIG_DFL);
    kill(getpid(), SIGTSTP);
    exit(exec_command(new_command, sys));
}

static char **create_new_command(char **command)
{
    ssize_t len_array = find_delim(command);
    char **array = malloc(sizeof(char *) * (len_array + 1));
    int index = 0;

    if (array == NULL)
        return NULL;
    array[len_array] = NULL;
    for (ssize_t i = 0; i < len_array && command[i] != NULL; i++) {
        array[index] = strdup(command[i]);
        if (array[index] == NULL)
            return NULL;
        index += 1;
    }
    return array;
}

void do_background(system_t *sys, char **command)
{
    pid_t id = 0;
    char **new_command = create_new_command(command);

    if (new_command == NULL || my_list_len(new_command) == 0)
        return;
    id = fork();
    if (id == - 1)
        return;
    if (id == 0) {
        put_on_background(sys, new_command);
    } else {
        fill_jobs_infos(sys->jobs, id, new_command);
        free_list(new_command);
    }
    print_jobs(sys->jobs->head);
}
