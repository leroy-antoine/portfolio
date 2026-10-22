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

int exec_l(tree_t *tree, system_t *sys)
{
    int fd = 0;

    if (sys->env == NULL)
        return EXIT_FAILURE;
    fd = open(tree->right->command[0], O_RDONLY);
    if (fd == -1) {
        dprintf(STDERR_FILENO, "%s: %s.\n",
            tree->right->command[0], strerror(errno));
        return EXIT_FAILURE;
    }
    dup2(fd, STDIN_FILENO);
    close(fd);
    return exec_operator(tree->left, sys);
}
