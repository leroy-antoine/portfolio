/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** create_script_cmd
*/

#include "mysh.h"
#include "my.h"
#include <string.h>

static script_cmd_t *create_scrip_cmd(char *cmd)
{
    script_cmd_t *element = malloc(sizeof(script_cmd_t));

    if (element == NULL)
        return NULL;
    element->cmd = format_cmd(cmd);
    if (element->cmd == NULL) {
        free(element);
        return NULL;
    }
    return element;
}

int add_script_cmd_node(linked_list_t *list, char *cmd)
{
    script_cmd_t *scrip_cmd = NULL;

    scrip_cmd = create_scrip_cmd(cmd);
    if (scrip_cmd == NULL)
        return EPI_ERROR;
    push_to_tail(list, scrip_cmd);
    return EPI_SUCCESS;
}
