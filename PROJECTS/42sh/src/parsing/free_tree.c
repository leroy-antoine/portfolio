/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** free_tree
*/

#include "mysh.h"
#include "my.h"
#include <stdlib.h>

void free_tree(tree_t *head)
{
    if (head == NULL)
        return;
    if (head->right != NULL)
        free_tree(head->right);
    if (head->left != NULL)
        free_tree(head->left);
    if (head->command != NULL)
        free_list(head->command);
    free(head);
}
