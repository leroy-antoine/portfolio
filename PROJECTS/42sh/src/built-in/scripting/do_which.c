/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_which
*/

#include "mysh.h"
#include "formatsh.h"
#include "my.h"
#include <sys/stat.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

static bool is_built_in(char *arg)
{
    for (size_t i = 0; i < ARRAY_SIZE(commands); i++)
        if (strcmp(commands[i].command, arg) == 0) {
            dprintf(STDOUT_FILENO, str_message[WHICH_BUILT_IN], arg);
            return true;
        }
    return false;
}

static int is_file_error(char *path)
{
    struct stat file_stat = {0};

    if (stat(path, &file_stat) == -1) {
        return false;
    }
    if (S_ISREG(file_stat.st_mode) == false) {
        return false;
    }
    return true;
}

static bool is_good_archi(char const *file)
{
    int fd = open(file, O_RDONLY);
    int byte = 0;

    if (fd == -1)
        return false;
    read(fd, &byte, 4);
    if (byte != ARCHI_MAGIC)
        return false;
    read(fd, &byte, 1);
    return true;
}

static int check_exec(char *arg, char *path)
{
    char *origin = NULL;

    if (is_built_in(arg) == true)
        return SUCCESS;
    origin = which_path(arg, path);
    if (origin == NULL && (is_file_error(arg) == false
        || is_good_archi(arg) == false)) {
        dprintf(STDOUT_FILENO, str_message[COM_NOT_FOUND], arg);
        return COMMAND_ERROR;
    }
    if (origin == NULL)
        dprintf(STDOUT_FILENO, "%s\n", arg);
    else {
        dprintf(STDOUT_FILENO, "%s\n", origin);
        free(origin);
    }
    return SUCCESS;
}

static int which_loop(char **args, system_t *sys)
{
    int return_value = 0;
    char *path = NULL;

    for (int i = 0; args[i] != NULL; i++) {
        path = get_env_var(sys->env, str_env[PATH_VAR]);
        if (path == NULL)
            return COMMAND_ERROR;
        return_value = check_exec(args[i], path);
    }
    return return_value;
}

int do_which(char **args, system_t *sys)
{
    if (my_list_len(args) < 2) {
        dprintf(STDERR_FILENO, "%s", str_message[WHICH_TOO_FEW]);
        return COMMAND_ERROR;
    }
    return which_loop(args + 1, sys);
}
