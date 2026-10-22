/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** free_env
*/

#include "mysh.h"

void free_env_var(void *data)
{
    free(data);
}
