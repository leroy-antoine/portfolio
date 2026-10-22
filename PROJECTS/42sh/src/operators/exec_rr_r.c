/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell2-ariel.amriou
** File description:
** exec_rr_r.c
*/

#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdlib.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include "mysh.h"
#include "my.h"

static int error_rr_r(tree_t *tree, system_t *sys, int *fd, int mode)
{
    if (sys->env == NULL)
        return EXIT_FAILURE;
    *fd = open(tree->right->command[0], O_WRONLY | O_CREAT | mode, 0664);
    if (*fd == -1) {
        dprintf(STDERR_FILENO, "%s: %s.\n",
            tree->right->command[0], strerror(errno));
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}

int exec_rr_r(tree_t *tree, system_t *sys, int mode)
{
    int fd = 0;
    pid_t pid = 0;
    int status[] = {0};

    if (error_rr_r(tree, sys, &fd, mode) == EXIT_FAILURE)
        return EXIT_FAILURE;
    dup2(fd, STDOUT_FILENO);
    close(fd);
    pid = fork();
    if (pid == -1)
        return EXIT_FAILURE;
    if (pid == 0) {
        status[0] = exec_operator(tree->left, sys);
        exit(status[0]);
    }
    waitpid(pid, NULL, 0);
    return status[0];
}
