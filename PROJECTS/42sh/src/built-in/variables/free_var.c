/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** free_var
*/

#include "mysh.h"

void free_var(void *data)
{
    var_t *var = (var_t *)data;

    free(var->var);
    free(var->value);
    free(var);
}
