/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** create_var
*/

#include <string.h>
#include "mysh.h"
#include "my.h"

var_t *create_var(char *var, char *value)
{
    var_t *var_list = malloc(sizeof(var_t));

    if (var_list == NULL)
        return NULL;
    var_list->var = strdup(var);
    if (var_list->var == NULL) {
        free(var_list);
        return NULL;
    }
    var_list->value = strdup(value);
    if (var_list->value == NULL) {
        free(var_list->var);
        free(var_list);
        return NULL;
    }
    return var_list;
}
