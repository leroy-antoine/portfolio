/*
** EPITECH PROJECT, 2025
** linked_list.h
** File description:
** linked_list.h
*/

#ifndef LINKED_LIST_H_
    #define LINKED_LIST_H_

    #define FRM_START 0
    #define FRM_END 1

    #include <stdlib.h>
    #include <stdio.h>
    #include <stdbool.h>

typedef struct node_s {
    void *data;
    struct node_s *next;
    struct node_s *prev;
} node_t;

typedef struct linked_list_s {
    node_t *head;
    node_t *tail;
} linked_list_t;

void sort_linked_list(
    linked_list_t *list, bool (*sort_data)(void *first, void *second));
void delete_node(linked_list_t *list, node_t *actual_node
    , void (*free_data)(void *data));
void push_to_head(linked_list_t *list, void *data);
void push_to_tail(linked_list_t *list, void *data);
linked_list_t *initialize_linked_list(void);
int get_list_len(linked_list_t *list);
void free_linked_list(linked_list_t *list, void (*free_data)(void *data));
void print_linked_list(node_t *list, void (*print_func)(void *data));
node_t *get_list_node(linked_list_t *list, void *data_to_compare,
    bool (*compare_func)(void *node_data, void *data_to_compare));
node_t *get_nth_node(linked_list_t *list, int index, int mode);

#endif
