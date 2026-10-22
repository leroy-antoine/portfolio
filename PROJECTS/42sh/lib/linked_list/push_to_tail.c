/*
** EPITECH PROJECT, 2025
** linked_list
** File description:
** push_to_tail
*/

#include "linked_list.h"

void push_to_tail(linked_list_t *list, void *data)
{
    node_t *new_node = malloc(sizeof(node_t));

    if (new_node == NULL)
        return;
    new_node->data = data;
    new_node->next = NULL;
    if (list->tail == NULL){
        new_node->prev = NULL;
        list->tail = new_node;
        list->head = new_node;
    } else {
        new_node->prev = list->tail;
        new_node->prev->next = new_node;
        list->tail = new_node;
    }
}
