/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_alias
*/

#include <string.h>
#include <unistd.h>
#include "mysh.h"
#include "my.h"

static int get_max_len_array(char **arg)
{
    int max_len = 0;
    int i = 0;

    while (arg[i] != NULL) {
        max_len += strlen(arg[i]) + 1;
        i++;
    }
    return max_len;
}

static char *get_dup_cmd(char **arg, bool *bracket)
{
    int max_len = get_max_len_array(arg);
    int i = 1;
    char *cmd = NULL;

    if (arg[1] == NULL)
        return strdup(*arg);
    cmd = malloc(sizeof(char) * max_len);
    if (cmd == NULL)
        return NULL;
    cmd = strcpy(cmd, *arg);
    while (arg[i] != NULL) {
        cmd = strcat(cmd, " ");
        cmd = strcat(cmd, arg[i]);
        i++;
    }
    *bracket = true;
    return cmd;
}

static bool is_here(node_t *head, char *alias, char *dup_cmd, bool bracket)
{
    alias_var_t *tmp = NULL;

    while (head != NULL) {
        tmp = (alias_var_t *)head->data;
        if (strcmp(alias, tmp->alias) == 0) {
            free(tmp->cmd);
            tmp->cmd = dup_cmd;
            tmp->bracket = bracket;
            return true;
        }
        head = head->next;
    }
    return false;
}

static void set_alias(
    linked_list_t *list, char *alias, char *dup_cmd, bool bracket)
{
    node_t *head = list->head;
    char *dup_alias = NULL;

    if (dup_cmd == NULL || is_here(head, alias, dup_cmd, bracket) == true)
        return;
    dup_alias = strdup(alias);
    if (dup_alias == NULL) {
        free(dup_cmd);
        return;
    }
    add_alias_node(list, dup_alias, dup_cmd, bracket);
}

static int display_alias(linked_list_t *alias)
{
    node_t *head = alias->head;
    alias_var_t *tmp = NULL;

    while (head != NULL) {
        tmp = (alias_var_t *)head->data;
        if (tmp->bracket == false)
            dprintf(STDOUT_FILENO, "%s\t%s\n", tmp->alias, tmp->cmd);
        else
            dprintf(STDOUT_FILENO, "%s\t(%s)\n", tmp->alias, tmp->cmd);
        head = head->next;
    }
    return EPI_SUCCESS;
}

int do_alias(char **arg, system_t *sys)
{
    bool bracket = false;
    char *tmp = NULL;

    arg++;
    if (arg[0] == NULL)
        return display_alias(sys->alias);
    if (arg[1] == NULL)
        return EPI_SUCCESS;
    tmp = get_dup_cmd(arg + 1, &bracket);
    set_alias(sys->alias, arg[0], tmp, bracket);
    sort_linked_list(sys->alias, &sort_alias_var);
    return EPI_SUCCESS;
}
