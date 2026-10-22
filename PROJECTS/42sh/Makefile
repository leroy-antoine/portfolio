##
## EPITECH PROJECT, 2025
## makefile
## File description:
## root makefile
##

CC ?= gcc

PATH_UNI = ./tests/unitest/test_42sh.c

INCLUDE_DIR = include

MAIN = src/main.c

SRC = 	$(addprefix src/, 						\
		mysh.c									\
		\
		built-in/cd/do_cd.c						\
		built-in/ia/do_ia.c						\
		built-in/ia/do_ia_setup.c				\
		built-in/exit/do_exit.c					\
		built-in/env/do_env.c					\
		built-in/env/do_setenv.c				\
		built-in/env/do_unsetenv.c				\
		built-in/env/get_env_var.c				\
		built-in/env/is_env_var.c				\
		built-in/env/get_env.c					\
		built-in/env/free_env_var.c 			\
		built-in/env/env_to_list.c 				\
		built-in/env/create_env_var.c 			\
		built-in/alias/create_alias_var.c 		\
		built-in/alias/free_alias_var.c 		\
		built-in/alias/sort_alias_var.c 		\
		built-in/alias/copy_myshrc.c			\
		built-in/alias/get_alias.c				\
		\
		system/initialize_system.c 				\
		system/end_shell.c						\
		\
		built-in/alias/do_alias.c				\
		built-in/alias/do_unalias.c				\
		built-in/alias/del_alias_var.c			\
		built-in/alias/check_alias.c			\
		built-in/history/add_to_history.c 		\
		built-in/history/do_history.c 			\
		built-in/history/get_history.c 			\
		built-in/history/save_history.c 		\
		built-in/history/free_history_cmd.c 	\
		built-in/scripting/do_which.c 			\
		built-in/scripting/do_where.c 			\
		built-in/scripting/do_repeat.c 			\
		built-in/scripting/do_foreach.c 		\
		built-in/scripting/do_if.c 				\
		built-in/scripting/get_condition.c 		\
		built-in/scripting/format_scripting.c 	\
		built-in/scripting/create_script_cmd.c	\
		built-in/scripting/free_script_cmd.c	\
		built-in/variables/create_var.c			\
		built-in/variables/free_var.c			\
		built-in/variables/do_set.c				\
		built-in/variables/do_unset.c			\
		built-in/variables/sort_var.c			\
		\
		parsing/which_path.c					\
		parsing/make_tree.c						\
		parsing/get_input.c						\
		parsing/check_tree.c					\
		parsing/check_operators.c				\
		parsing/format_cmd.c					\
		parsing/wave.c 	                    	\
		parsing/star.c 	                    	\
		parsing/question_mark.c 	        	\
		parsing/prompt.c 	                	\
		parsing/var.c 	                		\
		parsing/free_tree.c 					\
		\
		operators/exec_rr_r.c					\
		operators/error_branch.c				\
		operators/exec_pipe.c					\
		operators/exec_r.c						\
		operators/exec_rr.c						\
		operators/exec_l.c						\
		operators/exec_ll.c						\
		operators/exec_and.c					\
		operators/exec_or.c						\
		\
		execution/do_existing_command.c			\
		execution/exec_proper_function.c		\
		execution/exec_command_no_fork.c		\
		execution/exec_command.c				\
		execution/exec_operator.c				\
		\
		jobs/do_background.c					\
		jobs/do_fg.c							\
		jobs/init_jobs.c						\
		jobs/free_jobs.c						\
		jobs/print_jobs.c						\
		jobs/do_jobs.c							\
		\
		signals//handle_signals.c				\
		signals/do_ctrl_z.c						\
		signals/create_handler.c				\
		signals/is_signal.c						\
		signals/do_kill.c						\
		signals/handle_ctrl_c.c					\
		signals/do_ctrl_c.c						\
    )

OBJ = $(SRC:.c=.o) $(MAIN:.c=.o)

TESTS = tests_run

CFLAGS = -Wall -Wextra

CPPFLAGS = -iquote include

LDFLAGS = -L lib/linked_list -L lib/my

LDLIBS =  -llinked_list -lmy -lm -ljson-c

NAME = 42sh

all:	$(NAME)

$(NAME):	$(OBJ)
	make -C lib/my/
	make -C lib/linked_list/
	$(CC) -o $(NAME) $(OBJ) $(LDLIBS) $(LDFLAGS)

debug: CFLAGS += -g3
debug: fclean $(OBJ)
	make -C lib/my/ CFLAGS+=-g3
	make -C lib/linked_list/ CFLAGS+=-g3
	$(CC) -o $(NAME) $(OBJ) $(LDLIBS) $(LDFLAGS)

$(TESTS): LDFLAGS += --coverage -lcriterion
$(TESTS):
	make -C lib/my/
	make -C lib/linked_list/
	$(CC) -o $(TESTS) $(SRC) $(PATH_UNI) \
		$(LDLIBS) $(CPPFLAGS) $(LDFLAGS)
	./$(TESTS)

uni_clean:
	$(RM) $(TESTS)*

clean:
	make -C lib/my/ clean
	make -C lib/linked_list/ clean
	$(RM) $(OBJ)

fclean:	clean uni_clean
	$(RM) *.html coverage coverage.css
	make -C lib/my/ fclean
	make -C lib/linked_list/ fclean
	$(RM) $(NAME)

re: fclean all

tests:
	./tests/cmp.sh

tester: re
	./tests/test.sh

install:
	sudo apt install libjson-c-dev
	make
	sudo cp 42sh /bin
	sudo chmod u+x,g+x /bin/42sh
	sudo cp 42sh /usr/bin
	sudo chmod u+x,g+x /usr/bin/42sh

update: re
	sudo cp 42sh /bin
	sudo chmod u+x,g+x /bin/42sh
	sudo cp 42sh /usr/bin
	sudo chmod u+x,g+x /usr/bin/42sh

.PHONY: all debug clean fclean re tests tester uni_clean
