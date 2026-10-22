/*
** EPITECH PROJECT, 2024
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** do_ls.c
*/

#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <stdio.h>
#include <errno.h>
#include <stdbool.h>
#include <fcntl.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"

int is_file_error(char *path)
{
    struct stat file_stat = {0};

    if (stat(path, &file_stat) == -1) {
        dprintf(STDERR_FILENO, str_message[COM_NOT_FOUND], path);
        return false;
    }
    if (S_ISREG(file_stat.st_mode) == false) {
        dprintf(STDERR_FILENO, str_message[PERM_DENIED], path);
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

static void is_correct_file(char *file)
{
    if (is_file_error(file) == false)
        exit(1);
    if (is_good_archi(file) == false) {
        dprintf(STDERR_FILENO, str_message[FORM_ERROR], file);
        exit(1);
    }
}

static void error(int *status)
{
    int signal = WTERMSIG(*status);

    if (signal != 0) {
        if (signal == SIGFPE)
            dprintf(STDERR_FILENO, "%s", str_message[FLOAT_EXP]);
        else
            dprintf(STDERR_FILENO, "%s", strsignal(signal));
        if (__WCOREDUMP(signal) != 0)
            dprintf(STDERR_FILENO, "%s", str_message[CORE_DUMP]);
        dprintf(STDERR_FILENO, "\n");
        return;
    }
    *status = WEXITSTATUS(*status);
}

void command(char **args, system_t *sys,
    char **path, char **env_list)
{
    char *error = NULL;
    char *paths = get_env_var(sys->env, str_env[PATH_VAR]);

    if (is_env_variable(sys->env, str_env[PATH_VAR]) == false)
        paths = strdup(str_env[CONTENT_BASE_PATH]);
    *path = which_path(args[0], paths);
    if (*path == NULL)
        *path = args[0];
    is_correct_file(*path);
    if (execve(*path, args, env_list) == -1) {
        error = strerror(errno);
        dprintf(STDERR_FILENO, "%s: %s.\n", *path, error);
        exit(1);
    }
}

static void free_command_infos(char *path, char **env)
{
    free(path);
    path = NULL;
    free_list(env);
    close(STDOUT_FILENO);
    close(STDIN_FILENO);
}

static void check_signals(pid_t pid, int *status, system_t *sys, char **args)
{
    if (is_signal()->is_ctrl_c) {
        is_signal()->is_ctrl_c = false;
        do_ctrl_c(pid, status);
        return;
    }
    if (is_signal()->is_ctrl_z) {
        is_signal()->is_ctrl_z = false;
        do_ctrl_z(sys, args, pid, status);
    }
}

int do_existing_command(char **args, system_t *sys)
{
    int status = 0;
    char *path = NULL;
    char **env_list = env_to_list(sys->env);
    struct sigaction is_signals = create_handler(handle_signal);
    struct sigaction test = create_handler(handle_ctrl_c);
    pid_t pid = fork();

    sigaction(SIGTSTP, &is_signals, NULL);
    sigaction(SIGINT, &test, NULL);
    if (pid == -1 || env_list == NULL)
        return EPI_ERROR;
    if (pid == 0)
        command(args, sys, &path, env_list);
    waitpid(pid, &status, WUNTRACED);
    check_signals(pid, &status, sys, args);
    error(&status);
    free_command_infos(path, env_list);
    return status;
}
