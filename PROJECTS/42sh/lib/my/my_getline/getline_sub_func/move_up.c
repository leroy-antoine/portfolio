/*
** EPITECH PROJECT, 2024
** 42sh
** File description:
** move_up.c
*/

#include <string.h>
#include "formatsh.h"
#include "mysh.h"

int move_up(index_t __attribute_maybe_unused__ *ind)
{
    if (ind->history->history->tail == NULL)
        return SUCCESS;
    if (ind->current_cmd == NULL){
        ind->current_cmd = ind->history->history->tail;
    } else if (ind->current_cmd->prev != NULL){
        ind->current_cmd = ind->current_cmd->prev;
    }
    free(ind->buf);
    ind->buf = NULL;
    ind->buf = strdup(((history_cmd_t *)ind->current_cmd->data)->cmd);
    if (ind->buf == NULL)
        return EPI_ERROR;
    ind->len = strlen(ind->buf);
    ind->index = strlen(ind->buf);
    return SUCCESS;
}
