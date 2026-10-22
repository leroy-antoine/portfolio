/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** del_alias_var
*/

#include "mysh.h"
#include <string.h>

void del_alias_node(linked_list_t *alias, char *del)
{
    node_t *head = alias->head;
    alias_var_t *tmp = NULL;

    while (head != NULL) {
        tmp = (alias_var_t *)head->data;
        if (strcmp(tmp->alias, del) == 0) {
            delete_node(alias, head, &free_alias_var);
            break;
        }
        head = head->next;
    }
}
