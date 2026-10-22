/*
** EPITECH PROJECT, 2025
** B-PSU-200-PAR-2-1-minishell1-loan.riyanto
** File description:
** my_show_word_array
*/

#include <stdio.h>
#include "my.h"

void my_show_word_array(char **arr)
{
    for (int i = 0; arr[i] != NULL; i++){
        printf("%s\n", arr[i]);
    }
}
