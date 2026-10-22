/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** exec_proper_function.c
*/

#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdlib.h>
#include "mysh.h"
#include "my.h"

static int parse_tree(tree_t *tree, system_t *sys)
{
    int dup_stdin = 0;
    int dup_stdout = 0;
    int ret = 0;

    if (tree == NULL || tree->command == NULL || tree->command[0] == NULL)
        return EXIT_SUCCESS;
    if (tree->redirection != SEMICOLON) {
        if (check_tree(tree) == EXIT_FAILURE)
            return EXIT_FAILURE;
        dup_stdin = dup(STDIN_FILENO);
        dup_stdout = dup(STDOUT_FILENO);
        ret = exec_operator(tree, sys);
        dup2(dup_stdout, STDOUT_FILENO);
        close(dup_stdout);
        dup2(dup_stdin, STDIN_FILENO);
        close(dup_stdin);
        return ret;
    }
    parse_tree(tree->left, sys);
    return parse_tree(tree->right, sys);
}

int exec_proper_function(char **args,
    system_t *sys, int return_value)
{
    tree_t *tree = NULL;

    if (args == NULL)
        return return_value;
    if (args[0] == NULL) {
        free(args);
        return return_value;
    }
    tree = make_tree(args);
    if (tree == NULL)
        return EPI_ERROR;
    return_value = parse_tree(tree, sys);
    free_tree(tree);
    return return_value;
}
