/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** check_alias
*/

#include "mysh.h"
#include "my.h"
#include "formatsh.h"
#include <string.h>

static char **is_alias(char *arg, linked_list_t *alias)
{
    node_t *head = alias->head;
    alias_var_t *tmp = 0;

    while (head != NULL) {
        tmp = (alias_var_t *)head->data;
        if (tmp->status == true && strcmp(tmp->alias, arg) == 0) {
            tmp->status = false;
            return my_str_to_word_array(tmp->cmd, " ", "\'\"");
        }
        head = head->next;
    }
    return NULL;
}

static void reset_alias_status(linked_list_t *alias)
{
    node_t *head = alias->head;
    alias_var_t *tmp = 0;

    while (head != NULL) {
        tmp = (alias_var_t *)head->data;
        tmp->status = true;
        head = head->next;
    }
}

static bool is_new_cmd(char **args, int ind, linked_list_t *alias)
{
    if (ind == 0)
        return true;
    for (size_t i = 0; i < ARRAY_SIZE(start_new_cmd); i++) {
        if (strcmp(args[ind - 1], start_new_cmd[i]) == 0) {
            reset_alias_status(alias);
            return true;
        }
    }
    return false;
}

void check_alias(char ***args, linked_list_t *alias)
{
    char **tab = NULL;

    for (int i = 0; (*args)[i] != NULL; i++) {
        if (is_new_cmd(*args, i, alias) == false)
            continue;
        tab = is_alias((*args)[i], alias);
        if (tab != NULL) {
            *args = arraycat_n(*args, tab, i);
            i--;
        }
    }
    reset_alias_status(alias);
}
