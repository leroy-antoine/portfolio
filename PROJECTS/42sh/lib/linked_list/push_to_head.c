/*
** EPITECH PROJECT, 2025
** push_to_head.c
** File description:
** linked_list
*/

#include "linked_list.h"

void push_to_head(linked_list_t *list, void *data)
{
    node_t *new_node = malloc(sizeof(node_t));

    if (new_node == NULL)
        return;
    new_node->data = data;
    new_node->next = list->head;
    new_node->prev = NULL;
    if (list->head == NULL)
        list->tail = new_node;
    if (list->head != NULL)
        list->head->prev = new_node;
    list->head = new_node;
}
