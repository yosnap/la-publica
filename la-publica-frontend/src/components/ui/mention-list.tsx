import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { getImageUrl } from '@/utils/getImageUrl';

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
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-1 w-72" data-mention-list="true">
      {props.items.length ? (
        <ul className="overflow-y-auto" style={{ maxHeight: '160px' }}>
          {props.items.map((item, index) => (
            <li
              key={item._id}
              className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectItem(index);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectItem(index);
              }}
            >
              <div className="flex items-center space-x-2">
                {item.profilePicture ? (
                  <img 
                    src={getImageUrl(item.profilePicture)} 
                    alt={item.firstName}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-600 font-medium">
                      {item.firstName?.[0]}{item.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item.firstName} {item.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{item.username}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-sm px-3 py-2">
          No s'han trobat usuaris
        </div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';