/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_where
*/

#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "mysh.h"
#include "formatsh.h"
#include "my.h"

static bool is_built_in(char *arg)
{
    for (size_t i = 0; i < ARRAY_SIZE(commands); i++)
        if (strcmp(commands[i].command, arg) == 0) {
            dprintf(STDOUT_FILENO, str_message[WHERE_BUILT_IN], arg);
            return true;
        }
    return false;
}

static bool is_it_path(char *arg)
{
    for (int i = 0; arg[i] != '\0'; i++) {
        if (arg[i] == *str_management[SLASH]) {
            dprintf(STDOUT_FILENO, "%s", str_message[WHERE_IS_PATH]);
            return true;
        }
    }
    return false;
}

static int arg_loop(char *arg, char *path)
{
    int return_value = COMMAND_ERROR;
    char *tmp = strtok(path, str_management[COLON]);
    char *origin = NULL;

    if (is_built_in(arg) == true)
        return SUCCESS;
    if (is_it_path(arg) == true)
        return COMMAND_ERROR;
    while (tmp != NULL) {
        origin = which_path(arg, strdup(tmp));
        if (origin != NULL) {
            dprintf(STDOUT_FILENO, "%s\n", origin);
            return_value = EXIT_SUCCESS;
            free(origin);
        }
        tmp = strtok(NULL, str_management[COLON]);
    }
    return return_value;
}

static int where_loop(char **args, system_t *sys)
{
    int return_value = 0;
    char *path = NULL;

    for (int i = 0; args[i] != NULL; i++) {
        path = get_env_var(sys->env, str_env[PATH_VAR]);
        if (path == NULL)
            return COMMAND_ERROR;
        if (arg_loop(args[i], path) == COMMAND_ERROR)
            return_value = COMMAND_ERROR;
        free(path);
    }
    return return_value;
}

int do_where(char **args, system_t *sys)
{
    if (my_list_len(args) < 2) {
        dprintf(STDERR_FILENO, "%s", str_message[WHERE_TOO_FEW]);
        return COMMAND_ERROR;
    }
    return where_loop(args + 1, sys);
}
