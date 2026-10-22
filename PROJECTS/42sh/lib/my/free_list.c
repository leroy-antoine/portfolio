/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** free_list.c
*/

#include <stdlib.h>

void free_list(char **list)
{
    if (list == NULL)
        return;
    for (int i = 0; list[i] != NULL; i++) {
        free(list[i]);
        list[i] = NULL;
    }
    free(list);
}
