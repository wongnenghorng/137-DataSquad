// HeaderLinks.js
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import routes from 'routes';
import { Amplify } from 'aws-amplify';
import awsExports from '../../aws-exports';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { createProfile, updateProfile } from 'graphql/mutations';
import { listProfiles } from 'graphql/queries';
import {
  Authenticator,
  useAuthenticator,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsExports);
const client = generateClient();

export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const displayName = user?.attributes?.name || user?.username || 'Guest';
  const [showAuth, setShowAuth] = useState(false);
  const [profile, setProfile] = useState({ name: '', phoneNumber: '', email: '' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState(false);

  const navbarIcon = useColorModeValue('gray.400', 'white');
  const menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
  );

  const fetchProfile = async () => {
    const currentUser = await getCurrentUser();
    const email = currentUser.signInDetails?.loginId;

    const res = await client.graphql({
      query: listProfiles,
      variables: { filter: { email: { eq: email } } },
    });
    const existing = res.data.listProfiles.items[0];
    if (existing) {
      setProfile(existing);
      setEditing(true);
    } else {
      setProfile((prev) => ({ ...prev, email }));
    }
  };

  const saveProfile = async () => {
    if (editing) {
      await client.graphql({
        query: updateProfile,
        variables: { input: profile },
      });
    } else {
      await client.graphql({
        query: createProfile,
        variables: { input: profile },
      });
      setEditing(true);
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) fetchProfile();
  }, [isOpen]);

  return (
    <>
      <Flex
        w={{ sm: '100%', md: 'auto' }}
        alignItems="center"
        flexDirection="row"
        bg={menuBg}
        flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
        p="10px"
        borderRadius="30px"
        boxShadow={shadow}
      >
        <SearchBar
          mb={() => {
            if (secondary) {
              return { base: '10px', md: 'unset' };
            }
            return 'unset';
          }}
          me="10px"
          borderRadius="30px"
        />
        <SidebarResponsive routes={routes} />
        <Button
          variant="no-hover"
          bg="transparent"
          p="0px"
          minW="unset"
          minH="unset"
          h="18px"
          w="max-content"
          onClick={toggleColorMode}
        >
          <Icon
            me="10px"
            h="18px"
            w="18px"
            color={navbarIcon}
            as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
          />
        </Button>

        <Menu>
          <MenuButton p="0px">
            <Avatar
              _hover={{ cursor: 'pointer' }}
              color="white"
              name={displayName}
              bg="#11047A"
              size="sm"
              w="40px"
              h="40px"
            />
          </MenuButton>
          <MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
            <Flex w="100%" mb="0px">
              <Text
                ps="20px"
                pt="16px"
                pb="10px"
                w="100%"
                borderBottom="1px solid"
                borderColor={borderColor}
                fontSize="sm"
                fontWeight="700"
                color={textColor}
              >
                {user ? `👋 Hey, ${profile.name}` : 'Welcome, Guest'}
              </Text>
            </Flex>
            <Flex flexDirection="column" p="10px">
              {user ? (
                <>
                  <MenuItem onClick={onOpen}>
                    <Text fontSize="sm">Profile Settings</Text>
                  </MenuItem>
                  <MenuItem color="red.400" onClick={signOut}>
                    <Text fontSize="sm">Log out</Text>
                  </MenuItem>
                </>
              ) : (
                <MenuItem
                  color="green.400"
                  onClick={() => setShowAuth(true)}
                >
                  <Text fontSize="sm">Login</Text>
                </MenuItem>
              )}
            </Flex>
          </MenuList>
        </Menu>
      </Flex>

      {showAuth && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
          }}
          onClick={() => setShowAuth(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '400px',
              margin: '5% auto',
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Authenticator />
          </div>
        </div>
      )}

      {/* ✅ Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Profile Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Email (from Cognito)</FormLabel>
              <Input value={profile.email} isReadOnly />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={saveProfile}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
