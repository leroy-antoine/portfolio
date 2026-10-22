/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** create_alias_var
*/

#include "mysh.h"

alias_var_t *create_alias_var(char *alias, char *cmd, bool bracket)
{
    alias_var_t *element = malloc(sizeof(alias_var_t));

    if (element == NULL) {
        free(alias);
        free(cmd);
        return NULL;
    }
    element->alias = alias;
    element->cmd = cmd;
    element->status = true;
    element->bracket = bracket;
    return element;
}

void add_alias_node(linked_list_t *list, char *alias, char *cmd, bool bracket)
{
    alias_var_t *alias_var = NULL;

    alias_var = create_alias_var(alias, cmd, bracket);
    if (alias_var == NULL) {
        free(alias);
        free(cmd);
        return;
    }
    push_to_tail(list, alias_var);
}
