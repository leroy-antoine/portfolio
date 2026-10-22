/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell2-ariel.amriou
** File description:
** error_branch.c
*/

#include <unistd.h>
#include <stdlib.h>
#include "mysh.h"
#include "my.h"

int error_redirect(tree_t *branch, const char *error_msg)
{
    if (branch == NULL || branch->command == NULL ||
        branch->command[0] == NULL) {
        dprintf(STDERR_FILENO, "%s\n", error_msg);
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
