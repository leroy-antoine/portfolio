/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** unsetenv.c
*/

#include "my.h"
#include "mysh.h"
#include "formatsh.h"
#include <string.h>
#include <unistd.h>


//strtok_r(line, str_management[EQUAL], &line)

static bool is_var_key_same(void *node_data, void *arg)
{
    char *env_var_1 = NULL;
    char *env_var_2 = NULL;
    char *buff = NULL;

    if (node_data == NULL || arg == NULL)
        return false;
    buff = strdup((char *)node_data);
    if (buff == NULL)
        return false;
    env_var_1 = strtok_r(buff, str_management[EQUAL], &buff);
    env_var_2 = (char *)arg;
    if (env_var_1 == NULL || env_var_2 == NULL)
        return false;
    if (strcmp(env_var_1, env_var_2) == 0)
        return true;
    return false;
}

static void remove_var(char *arg, linked_list_t *env)
{
    node_t *node = NULL;

    if (env == NULL || arg == NULL)
        return;
    node = get_list_node(env, arg, &is_var_key_same);
    if (node == NULL)
        return;
    delete_node(env, node, free_env_var);
    return;
}

int do_unsetenv(char **args, system_t *sys)
{
    if (args == NULL)
        return COMMAND_ERROR;
    if (my_list_len(args) < 2) {
        dprintf(STDERR_FILENO, "%s", str_message[UNSETENV_TOO_FEW]);
        return COMMAND_ERROR;
    }
    args++;
    while (*args != NULL) {
        remove_var(*args, sys->env);
        args++;
    }
    return EPI_SUCCESS;
}
