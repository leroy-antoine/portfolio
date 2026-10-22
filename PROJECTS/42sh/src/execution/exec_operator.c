/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell2-ariel.amriou
** File description:
** exec_operator.c
*/

#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdlib.h>
#include "mysh.h"
#include "my.h"

int exec_operator(tree_t *tree, system_t *sys)
{
    if (tree->redirection == NONE)
        return exec_command(tree->command, sys);
    for (size_t i = 0; i < ARRAY_SIZE(redirection_list); i++)
        if (tree->redirection == redirection_list[i].redirection)
            return redirection_list[i].exec_operator(tree, sys);
    return EPI_ERROR;
}
