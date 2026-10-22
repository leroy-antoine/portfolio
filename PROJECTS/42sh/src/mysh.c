/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** mysh.c
*/

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include "mysh.h"
#include <signal.h>
#include "my.h"
#include "formatsh.h"
#include "linked_list.h"

static int change_old_pwd(linked_list_t *env)
{
    char *path = get_env_var(env, str_env[OLDPWD_VAR]);

    if (path == NULL)
        return EPI_SUCCESS;
    free(path);
    if (change_or_create(str_env[OLDPWD_VAR], NULL, env) == EPI_ERROR)
        return EPI_ERROR;
    return EPI_SUCCESS;
}

void init_prompt(prompt_t *variable, system_t *sys)
{
    int len = 0;

    variable->user = get_env_var(sys->env, str_env[USER_VAR]);
    sys->user = variable->user;
    variable->hostname = open_file(str_env[HOSTNAME]);
    if (variable->hostname != NULL) {
        len = strlen(variable->hostname);
        if (variable->hostname[len - 1] == '\n')
            variable->hostname[len - 1] = '\0';
    }
    variable->status = 0;
}

void shell_loop(char *command, char **args, prompt_t *variables, system_t *sys)
{
    int status = EPI_SUCCESS;

    while (status != EPI_ERROR) {
        status = get_input(&command, &args, variables, sys);
        if (status == EPI_ERROR)
            break;
        if (status == COMMAND_ERROR) {
            variables->status = COMMAND_ERROR;
            continue;
        }
        variables->status = exec_proper_function(dup_list(args),
            sys, variables->status);
        free(sys->input);
        free_list(args);
        args = NULL;
        if (sys->has_exited == true)
            break;
        if (status == EOF)
            break;
    }
}

int mysh(system_t *sys)
{
    char *command = NULL;
    char **args = NULL;
    prompt_t variables = {NULL};

    init_prompt(&variables, sys);
    if (sys->env == NULL || change_old_pwd(sys->env) == EPI_ERROR)
        return EPI_ERROR;
    shell_loop(command, args, &variables, sys);
    end_shell(command, args, sys, &variables);
    return variables.status;
}
