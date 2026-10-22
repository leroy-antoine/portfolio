/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell2-ariel.amriou
** File description:
** check_tree.c
*/

#include <unistd.h>
#include <stdlib.h>
#include "mysh.h"
#include "my.h"
#include "formatsh.h"

static int check_type(tree_t *tree)
{
    if (tree == NULL)
        return EXIT_SUCCESS;
    for (size_t i = 0; i < ARRAY_SIZE(redirection_list); i++) {
        if (redirection_list[i].check_error == NULL)
            continue;
        if (tree->redirection == redirection_list[i].redirection)
            return redirection_list[i].check_error(tree);
    }
    return EXIT_SUCCESS;
}

int check_tree(tree_t *tree)
{
    if (tree->left != NULL && check_tree(tree->left) == EXIT_FAILURE)
        return EXIT_FAILURE;
    if (tree->right != NULL && check_tree(tree->right) == EXIT_FAILURE)
        return EXIT_FAILURE;
    return check_type(tree);
}
