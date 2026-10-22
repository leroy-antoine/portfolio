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
#include <stdio.h>
#include "mysh.h"
#include "my.h"

static void get_input_ll(char *break_string, int fd)
{
    char *line = NULL;
    char *tmp = NULL;
    size_t n = 0;
    char *total = strdup("");

    if (total == NULL)
        return;
    while (getline(&line, &n, stdin) != EOF) {
        line[strlen(line) - 1] = '\0';
        if (strcmp(line, break_string) == 0)
            break;
        line[strlen(line)] = '\n';
        tmp = total;
        total = my_strcat_inf(2, tmp, line);
        free(tmp);
        if (total == NULL)
            break;
    }
    free(line);
    dprintf(fd, "%s", total);
}

int exec_ll(tree_t *tree, system_t *sys)
{
    int fds[2] = {0};

    if (sys == NULL)
        return EXIT_FAILURE;
    if (pipe(fds) == -1)
        return EXIT_FAILURE;
    get_input_ll(tree->right->command[0], fds[1]);
    dup2(fds[0], STDIN_FILENO);
    close(fds[0]);
    close(fds[1]);
    return exec_operator(tree->left, sys);
}
