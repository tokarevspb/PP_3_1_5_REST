package ru.kata.spring.boot_security.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.entities.User;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;

import java.util.List;

@Service
public class UserServiceImpl implements UserService, UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public boolean addUser(User user) {
        user.setUsername(user.getEmail());
        if (userRepository.findByUsername(user.getUsername()) == null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(long id) {
        return userRepository.getReferenceById(id);
    }

    @Override
    @Transactional
    public boolean updateUser(User user) {
        user.setUsername(user.getEmail());
        if ((userRepository.findByUsername(user.getUsername()) != null) && (userRepository.findByUsername(user.getUsername()).getId() != user.getId())) {
            return false;
        }
        user.setPassword(user.getPassword() == null || user.getPassword().isEmpty() ? userRepository.findById(user.getId()).get().getPassword() : passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteUserById(long id) {
        if (userRepository.findById(id).isPresent()) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByName(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = userRepository.findByUsername(email);
        }
        if (user == null) {
            throw new UsernameNotFoundException(String.format("User '%s' not found", email));
        }
        return user;
    }
}
