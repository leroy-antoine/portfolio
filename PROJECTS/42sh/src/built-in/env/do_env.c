/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** do_env.c
*/

#include <unistd.h>
#include "my.h"
#include "mysh.h"

static void print_env_var(void *data)
{
    if (data == NULL)
        return;
    dprintf(STDOUT_FILENO, "%s\n", (char *)data);
    return;
}

int do_env(char **args, system_t *sys)
{
    if (args == NULL || sys->env == NULL)
        return ENV_ERROR;
    print_linked_list(sys->env->head, print_env_var);
    return EPI_SUCCESS;
}
