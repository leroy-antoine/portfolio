##
## EPITECH PROJECT, 2024
## makefile
## File description:
## root makefile
##

SRC =	my_str_to_word_array.c							\
		my_is_number.c									\
		my_intlen.c										\
		free_list.c										\
		my_list_len.c									\
		dup_list.c										\
		my_strcat_inf.c									\
		my_strdup_delim.c								\
		my_free.c										\
		is_file.c										\
		open_file.c										\
		help.c											\
		array.c              							\
		copy_array.c									\
		get_file_lines_nb.c 							\
		get_to_nth_line.c 								\
		is_int_float.c 									\
		my_join_array.c 								\
		my_show_word_array.c 							\
		my_merge_word_array.c 							\
		my_revstrndup.c									\
		my_free_str.c									\
		is_in_str.c 									\
		get_nblen.c										\
		is_between_str.c 								\
		array_dup_offset.c								\
		\
		my_getline/my_getline.c							\
		my_getline/getline_sub_func/move_up.c			\
		my_getline/getline_sub_func/move_down.c			\
		my_getline/getline_sub_func/move_right.c		\
		my_getline/getline_sub_func/move_left.c 		\
		my_getline/getline_sub_func/is_del.c   			\
		my_getline/getline_sub_func/is_tab.c   			\
		my_getline/getline_sub_func/is_new_line.c		\
		my_getline/getline_sub_func/is_esc.c     		\
		my_getline/exec_sub_func/exec_del.c 			\
		my_getline/exec_sub_func/exec_new_line.c		\
		my_getline/exec_sub_func/exec_esc.c     		\
		my_getline/exec_sub_func/exec_tab.c     		\
		my_getline/exec_sub_func/do_tab.c     			\
		my_getline/exec_sub_func/exec_add_letter.c		\
		my_getline/getline_sub_func/get_arrow.c   		\
		my_getline/init_getline.c              			\
		my_getline/getline_sub_func/is_ctrl_d.c			\
		my_getline/prompt/prompt_handling.c				\
		my_getline/prompt/del_line.c    				\
		my_getline/exec_sub_func/exec_ctrl_d.c			\
		my_getline/getline_sub_func/is_ctrl_l.c			\
		my_getline/exec_sub_func/exec_ctrl_l.c 			\
		my_getline/prompt/write_wave.c					\
		my_getline/prompt/write_git.c					\
		my_getline/prompt/write_time.c					\
		my_getline/prompt/write_path.c					\
		my_getline/prompt/write_hostname.c				\
		my_getline/prompt/write_nb.c      				\
		my_getline/prompt/write_user.c					\
		my_getline/prompt/write_jump_line.c				\
		my_getline/prompt/write_char.c					\

OBJ = $(SRC:.c=.o)

CFLAGS = -Wall -Wextra

CPPFLAGS = -iquote ../../include

NAME = libmy.a

all:	$(NAME)

$(NAME):	$(OBJ)
	$(AR) rc $(NAME) $(OBJ)

clean:
	$(RM) $(OBJ)

fclean: clean
	$(RM) $(NAME)

re: fclean all

.PHONY:	all	clean fclean re
