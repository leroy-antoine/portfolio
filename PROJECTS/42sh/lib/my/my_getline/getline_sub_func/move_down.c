/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** move_down.c
*/

#include <string.h>
#include "formatsh.h"
#include "mysh.h"

int move_down(index_t __attribute_maybe_unused__ *ind)
{
    if (ind->current_cmd == NULL){
        return SUCCESS;
    } else {
        ind->current_cmd = ind->current_cmd->next;
    }
    free(ind->buf);
    ind->buf = NULL;
    if (ind->current_cmd == NULL){
        ind->index = 0;
        ind->len = 0;
        return SUCCESS;
    }
    ind->buf = strdup(((history_cmd_t *)ind->current_cmd->data)->cmd);
    if (ind->buf == NULL)
        return EPI_ERROR;
    ind->len = strlen(ind->buf);
    ind->index = strlen(ind->buf);
    return SUCCESS;
}
