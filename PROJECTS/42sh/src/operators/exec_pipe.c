/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell2-ariel.amriou
** File description:
** exec_pipe.c
*/

#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdlib.h>
#include "mysh.h"
#include "my.h"

static int split_pipe(char ***env_list,
    int fds[2], linked_list_t *env, pid_t *pid)
{
    *env_list = env_to_list(env);
    if (*env_list == NULL || pipe(fds) == -1)
        return EXIT_FAILURE;
    *pid = fork();
    if (*pid == -1)
        return EXIT_FAILURE;
    return EXIT_SUCCESS;
}

static void fd_pipe(char *path, char **env_list, int fds[2])
{
    free(path);
    free_list(env_list);
    dup2(fds[0], STDIN_FILENO);
    close(fds[0]);
    close(fds[1]);
}

int exec_pipe(tree_t *tree, system_t *sys)
{
    int fds[2];
    pid_t pid = 0;
    char *path = NULL;
    char **env_list = NULL;
    int status = 0;
    int ret = 0;

    if (tree->redirection == NONE)
        return exec_command(tree->command, sys);
    if (split_pipe(&env_list, fds, sys->env, &pid))
        return EXIT_FAILURE;
    if (pid == 0) {
        close(fds[0]);
        dup2(fds[1], STDOUT_FILENO);
        exec_command_no_fork(tree->left->command, sys, &path, env_list);
    }
    fd_pipe(path, env_list, fds);
    ret = exec_pipe(tree->right, sys);
    waitpid(pid, &status, 0);
    return ret;
}
