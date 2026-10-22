/*
** EPITECH PROJECT, 2025
** 42sh
** File description:
** print_linked_list
*/

#include "linked_list.h"

void print_linked_list(node_t *list, void (*print_func)(void *data))
{
    node_t *head = list;

    if (list == NULL || print_func == NULL)
        return;
    while (head != NULL){
        print_func(head->data);
        head = head->next;
    }
    return;
}
