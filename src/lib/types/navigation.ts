export interface BottomNavigationProps {
  className?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}
