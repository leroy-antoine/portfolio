/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-ariel.amriou
** File description:
** my_list_len.c
*/

#include <stddef.h>


int my_list_len(char **list)
{
    int i = 0;

    if (list == NULL)
        return 0;
    while (list[i] != NULL)
        i++;
    return i;
}
