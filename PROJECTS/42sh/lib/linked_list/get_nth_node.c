/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** get_nth_node
*/

#include "linked_list.h"

node_t *get_nth_node(linked_list_t *list, int index, int mode)
{
    int i = 0;
    node_t *node = NULL;

    if (index < 1)
        return NULL;
    if (mode == FRM_START)
        node = list->head;
    else
        node = list->tail;
    while (node != NULL && i < index){
        if (mode == FRM_START)
            node = node->next;
        else
            node = node->prev;
        i++;
    }
    return node;
}
