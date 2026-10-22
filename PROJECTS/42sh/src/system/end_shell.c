/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** end_shell
*/

#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"
#include "linked_list.h"

static int free_all(char *command,
    char **args, system_t *sys, prompt_t *variable)
{
    if (isatty(STANDARD_INPUT) == 1 && sys->has_exited == false)
        dprintf(STDOUT_FILENO, "%s", str_message[EXIT]);
    free(command);
    free_list(args);
    free(variable->user);
    free(variable->hostname);
    if (sys->prompt != NULL)
        free(sys->prompt);
    free_linked_list(sys->env, &free_env_var);
    free_linked_list(sys->alias, &free_alias_var);
    free_linked_list(sys->var, &free_var);
    free_linked_list(sys->jobs, &free_jobs);
    return EPI_SUCCESS;
}

static void free_history(history_t *history)
{
    free(history->hist_file_path);
    free_linked_list(history->history, free_history_cmd);
    free(history);
}

void end_shell(char *command,
    char **args, system_t *sys, prompt_t *variable)
{
    free_all(command, args, sys, variable);
    save_history(sys->history);
    free_history(sys->history);
    free(sys);
    return;
}
