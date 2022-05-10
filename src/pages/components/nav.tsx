import React from 'react';
import { Button, Menu, Icon } from 'semantic-ui-react';

export default function Nav() {
  return (
    <>
      <Menu>
        <Menu.Item name="Courses" />
        <Menu.Item name="Reviews" />
        <Menu.Menu position="right">
          <Menu.Item>
            <Icon name="coffee" />
          </Menu.Item>
          <Menu.Item>
            <Button primary>Login</Button>
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    </>
  );
}
