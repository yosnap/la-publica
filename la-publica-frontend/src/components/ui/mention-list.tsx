import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface MentionListProps {
  items: User[];
  command: (props: any) => void;
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item.username, label: item.username });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-w-xs">
      {props.items.length ? (
        <ul className="space-y-1">
          {props.items.map((item, index) => (
            <li
              key={item._id}
              className={`p-2 rounded cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => selectItem(index)}
            >
              <div>
                <div className={`text-sm font-medium ${
                  index === selectedIndex 
                    ? 'text-blue-900 dark:text-blue-100' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {item.firstName} {item.lastName}
                </div>
                <div className={`text-xs ${
                  index === selectedIndex 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  @{item.username}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-sm p-2">
          No se encontraron usuarios
        </div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';