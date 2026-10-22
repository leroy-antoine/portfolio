/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** do_unset
*/

#include "mysh.h"
#include "formatsh.h"
#include "my.h"
#include <unistd.h>
#include <string.h>

static void del_var(char *name, linked_list_t *list)
{
    node_t *head = list->head;

    while (head != NULL) {
        if (strcmp(((var_t *)head->data)->var, name) == 0) {
            delete_node(list, head, &free_var);
            break;
        }
        head = head->next;
    }
}

int do_unset(char **args, system_t *sys)
{
    if (my_list_len(args) < 2) {
        dprintf(STDERR_FILENO, "%s", str_message[UNSET_TOO_FEW]);
        return COMMAND_ERROR;
    }
    for (int i = 1; args[i] != NULL; i++)
        del_var(args[i], sys->var);
    return SUCCESS;
}
