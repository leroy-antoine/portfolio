##
## EPITECH PROJECT, 2025
## makefile
## File description:
## makefile
##

SRC	= push_to_head.c \
	delete_node.c \
	push_to_tail.c \
	initialize_linked_list.c \
	get_list_len.c \
	free_linked_list.c \
	print_linked_list.c \
	get_list_node.c \
	sort_linked_list.c \
	get_nth_node.c \

OBJ	= $(SRC:.c=.o)

CPPFLAGS = -iquote ../../include

NAME = liblinked_list.a

all:	$(NAME)

$(NAME):	$(OBJ)
		ar rc $(NAME) $(OBJ)

clean:
		rm -f $(OBJ)
fclean: clean
		rm -f $(NAME)

re:	fclean all

.PHONY:	all	clean fclean re
