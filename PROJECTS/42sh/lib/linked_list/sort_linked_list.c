/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** sort_linked_list
*/

#include "mysh.h"
#include <string.h>

static void swap_edge(
    node_t *node1, node_t *node2, node_t *prev1, node_t *next2)
{
    if (node1->next == node2) {
        node1->prev = node2;
        node2->next = node1;
    } else {
        node1->next->prev = node2;
        node2->prev->next = node1;
        node1->prev = node2->prev;
        node2->next = node1->next;
    }
    node2->prev = prev1;
    node1->next = next2;
}

static void swap_nodes(linked_list_t *list, node_t *node1, node_t *node2)
{
    node_t *prev1 = node1->prev;
    node_t *next2 = node2->next;

    if (prev1 != NULL)
        prev1->next = node2;
    else
        list->head = node2;
    if (next2 != NULL)
        next2->prev = node1;
    else
        list->tail = node1;
    swap_edge(node1, node2, prev1, next2);
}

static node_t *find_switch_node(
    node_t *start, bool (*sort_data)(void *first, void *second))
{
    node_t *node = start;
    node_t *runner = start->next;

    while (runner != NULL) {
        if (sort_data(runner->data, node->data) == true)
            node = runner;
        runner = runner->next;
    }
    return node;
}

void sort_linked_list(
    linked_list_t *list, bool (*sort_data)(void *first, void *second))
{
    node_t *current = list->head;
    node_t *node = NULL;

    if (current == NULL)
        return;
    while (current->next != NULL) {
        node = find_switch_node(current, sort_data);
        if (node != current) {
            swap_nodes(list, current, node);
            current = node;
        } else
            current = current->next;
    }
}
