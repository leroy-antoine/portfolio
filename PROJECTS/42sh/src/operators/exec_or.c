/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** exec_and.c
*/

#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdlib.h>
#include "mysh.h"
#include "my.h"

int exec_or(tree_t *tree, system_t *sys)
{
    char **env_list = NULL;
    int ret = 0;
    int dup_stdout = dup(STDOUT_FILENO);
    int dup_stdin = dup(STDIN_FILENO);

    env_list = env_to_list(sys->env);
    if (env_list == NULL)
        return EXIT_FAILURE;
    ret = exec_operator(tree->left, sys);
    dup2(dup_stdout, STDOUT_FILENO);
    close(dup_stdout);
    dup2(dup_stdin, STDIN_FILENO);
    close(dup_stdin);
    if (ret == 0)
        return ret;
    return exec_operator(tree->right, sys);
}
