/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** cd.c
*/

#include <unistd.h>
#include <stdlib.h>
#include <stdbool.h>
#include <errno.h>
#include <string.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"

static int can_access_file(char *path)
{
    if (access(path, F_OK) == 0) {
        if (is_file(path) == 1) {
            dprintf(STDERR_FILENO, str_message[NOT_DIR], path);
            return EPI_ERROR;
        }
        if (access(path, R_OK) != 0) {
            dprintf(STDERR_FILENO, str_message[PERM_DENIED], path);
            return EPI_ERROR;
        }
    }
    return EPI_SUCCESS;
}

static int error_cd(linked_list_t *env, char **args, int len, char **old_pwd)
{
    if (env == NULL || args == NULL)
        return my_free(COMMAND_ERROR, 0, NULL, old_pwd, NULL);
    if (len > 2)
        return my_free(COMMAND_ERROR, 2,
        str_message[CD_TOO_MANY], old_pwd, NULL);
    return EPI_SUCCESS;
}

static int update_var(linked_list_t *head, const char *var)
{
    char wd[PATH_MAX_LEN];

    getcwd(wd, PATH_MAX_LEN);
    if (change_or_create(var, wd, head) == EPI_ERROR)
        return COMMAND_ERROR;
    return EPI_SUCCESS;
}

static int go_old(char *old_pwd, linked_list_t *head)
{
    if (chdir(old_pwd) == -1) {
        dprintf(STDERR_FILENO, str_message[NO_FILE_DIR], old_pwd);
        free(old_pwd);
        return COMMAND_ERROR;
    }
    update_var(head, str_env[PWD_VAR]);
    free(old_pwd);
    return EPI_SUCCESS;
}

static int go_home(linked_list_t *head)
{
    char *home = get_env_var(head, str_env[HOME_VAR]);

    if (can_access_file(home) == EPI_ERROR) {
        free(home);
        return COMMAND_ERROR;
    }
    if (chdir(home) == -1) {
        dprintf(STDERR_FILENO, str_message[NO_FILE_DIR], home);
        free(home);
        return COMMAND_ERROR;
    }
    update_var(head, str_env[PWD_VAR]);
    free(home);
    return EPI_SUCCESS;
}

static int change_directory(char *path, linked_list_t *head)
{
    if (can_access_file(path) == EPI_ERROR)
        return COMMAND_ERROR;
    if (chdir(path) == -1) {
        if (path[0] != *str_management[WAVE])
            dprintf(STDERR_FILENO, str_message[NO_FILE_DIR], path);
        return COMMAND_ERROR;
    }
    update_var(head, str_env[PWD_VAR]);
    return EPI_SUCCESS;
}

static int cd_one_args(linked_list_t *env, char *old_pwd)
{
    free(old_pwd);
    if (go_home(env) == COMMAND_ERROR) {
        return COMMAND_ERROR;
    } else {
        return EPI_SUCCESS;
    }
}

int do_cd(char **args, system_t *sys)
{
    int len = my_list_len(args);
    char *path = NULL;
    char *old_pwd = get_env_var(sys->env, str_env[OLDPWD_VAR]);

    update_var(sys->env, str_env[OLDPWD_VAR]);
    if (error_cd(sys->env, args, len, &old_pwd) != 0)
        return COMMAND_ERROR;
    if (len == 1)
        return cd_one_args(sys->env, old_pwd);
    if (strcmp(args[1], str_management[DASH]) == 0)
        return go_old(old_pwd, sys->env);
    path = strdup(args[1]);
    if (change_directory(path, sys->env) == COMMAND_ERROR)
        return my_free(COMMAND_ERROR, 0, NULL, &path, &old_pwd, NULL);
    return my_free(EPI_SUCCESS, 0, NULL, &path, &old_pwd, NULL);
}
