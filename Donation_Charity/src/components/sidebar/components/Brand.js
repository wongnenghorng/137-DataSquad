import React from "react";
import { Flex, Image, Link as ChakraLink } from "@chakra-ui/react";
import { HSeparator } from "components/separator/Separator";
import { Link as RouterLink } from "react-router-dom"; // React Router 路由跳转
import logo from "assets/img/logo.png"; // 请确保路径正确

export function SidebarBrand() {
  return (
    <Flex align="center" direction="column">
      <ChakraLink as={RouterLink} to="/admin/default">
        <Image
          src={logo}
          alt="Donation Charity System Logo"
          h="100px"
          w="auto"
          my="32px"
          objectFit="contain"
          _hover={{ cursor: "pointer", transform: "scale(1.05)" }}
          transition="all 0.3s ease"
        />
      </ChakraLink>
      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
