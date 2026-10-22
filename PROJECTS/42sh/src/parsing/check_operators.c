/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** check_operators.c
*/

#include <unistd.h>
#include <stdlib.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"

int check_and(tree_t *tree)
{
    if (error_redirect(tree->right, str_message[NULL_COM]))
        return EXIT_FAILURE;
    return EXIT_SUCCESS;
}

int check_ll(tree_t *tree)
{
    if (tree->right != NULL && tree->right->redirection == PIPE) {
        dprintf(STDERR_FILENO, "%s", str_message[AMBI_IN]);
        return EXIT_FAILURE;
    }
    if (error_redirect(tree->right, str_message[MISS_NAME])
        || error_redirect(tree->left, str_message[NULL_COM]))
        return EXIT_FAILURE;
    return EXIT_SUCCESS;
}

int check_l(tree_t *tree)
{
    if (tree->left != NULL && tree->left->redirection == PIPE) {
        dprintf(STDERR_FILENO, "%s", str_message[AMBI_IN]);
        return EXIT_FAILURE;
    }
    if (error_redirect(tree->right, str_message[MISS_NAME])
        || error_redirect(tree->left, str_message[NULL_COM]))
        return EXIT_FAILURE;
    if (is_file(tree->right->command[0]) == 0) {
        dprintf(STDERR_FILENO, str_message[NO_FILE_DIR],
            tree->right->command[0]);
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}

int check_pipe_or(tree_t *tree)
{
    if (error_redirect(tree->right, str_message[NULL_COM])
        || error_redirect(tree->left, str_message[NULL_COM]))
        return EXIT_FAILURE;
    return EXIT_SUCCESS;
}

int check_r_rr(tree_t *tree)
{
    if (tree->right != NULL && tree->right->redirection != NONE) {
        dprintf(STDERR_FILENO, "%s", str_message[AMBI_OUT]);
        return EXIT_FAILURE;
    }
    if (error_redirect(tree->right, str_message[MISS_NAME])
        || error_redirect(tree->left, str_message[NULL_COM]))
        return EXIT_FAILURE;
    if (tree->right->redirection == REDIRECTION_L &&
        is_file(tree->right->right->command[0]) == 0) {
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
