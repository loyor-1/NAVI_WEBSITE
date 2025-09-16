<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const elements = ref([
    { disabled: false, number: 1, symbol: 'H', name: '氢', mass: 1.008, category: 'nonmetal', x: 1, y: 1, electron: '1s¹', electronegativity: 2.20, discovered: 1766 },
    { disabled: false, number: 2, symbol: 'He', name: '氦', mass: 4.0026, category: 'noble', x: 18, y: 1, electron: '1s²', electronegativity: null, discovered: 1895 },
    { disabled: false, number: 3, symbol: 'Li', name: '锂', mass: 6.94, category: 'alkali', x: 1, y: 2, electron: '[He] 2s¹', electronegativity: 0.98, discovered: 1817 },
    { disabled: false, number: 4, symbol: 'Be', name: '铍', mass: 9.0122, category: 'alkaline', x: 2, y: 2, electron: '[He] 2s²', electronegativity: 1.57, discovered: 1798 },
    { disabled: false, number: 5, symbol: 'B', name: '硼', mass: 10.81, category: 'semimetal', x: 13, y: 2, electron: '[He] 2s² 2p¹', electronegativity: 2.04, discovered: 1808 },
    { disabled: false, number: 6, symbol: 'C', name: '碳', mass: 12.011, category: 'nonmetal', x: 14, y: 2, electron: '[He] 2s² 2p²', electronegativity: 2.55, discovered: '古代' },
    { disabled: false, number: 7, symbol: 'N', name: '氮', mass: 14.007, category: 'nonmetal', x: 15, y: 2, electron: '[He] 2s² 2p³', electronegativity: 3.04, discovered: 1772 },
    { disabled: false, number: 8, symbol: 'O', name: '氧', mass: 15.999, category: 'nonmetal', x: 16, y: 2, electron: '[He] 2s² 2p⁴', electronegativity: 3.44, discovered: 1774 },
    { disabled: false, number: 9, symbol: 'F', name: '氟', mass: 18.998, category: 'halogen', x: 17, y: 2, electron: '[He] 2s² 2p⁵', electronegativity: 3.98, discovered: 1886 },
    { disabled: false, number: 10, symbol: 'Ne', name: '氖', mass: 20.180, category: 'noble', x: 18, y: 2, electron: '[He] 2s² 2p⁶', electronegativity: null, discovered: 1898 },
    // 第三周期
    { disabled: false, number: 11, symbol: 'Na', name: '钠', mass: 22.990, category: 'alkali', x: 1, y: 3, electron: '[Ne] 3s¹', electronegativity: 0.93, discovered: 1807 },
    { disabled: false, number: 12, symbol: 'Mg', name: '镁', mass: 24.305, category: 'alkaline', x: 2, y: 3, electron: '[Ne] 3s²', electronegativity: 1.31, discovered: 1755 },
    { disabled: false, number: 13, symbol: 'Al', name: '铝', mass: 26.982, category: 'basic-metal', x: 13, y: 3, electron: '[Ne] 3s² 3p¹', electronegativity: 1.61, discovered: 1825 },
    { disabled: false, number: 14, symbol: 'Si', name: '硅', mass: 28.085, category: 'semimetal', x: 14, y: 3, electron: '[Ne] 3s² 3p²', electronegativity: 1.90, discovered: 1824 },
    { disabled: false, number: 15, symbol: 'P', name: '磷', mass: 30.974, category: 'nonmetal', x: 15, y: 3, electron: '[Ne] 3s² 3p³', electronegativity: 2.19, discovered: 1669 },
    { disabled: false, number: 16, symbol: 'S', name: '硫', mass: 32.06, category: 'nonmetal', x: 16, y: 3, electron: '[Ne] 3s² 3p⁴', electronegativity: 2.58, discovered: '古代' },
    { disabled: false, number: 17, symbol: 'Cl', name: '氯', mass: 35.45, category: 'halogen', x: 17, y: 3, electron: '[Ne] 3s² 3p⁵', electronegativity: 3.16, discovered: 1774 },
    { disabled: false, number: 18, symbol: 'Ar', name: '氩', mass: 39.948, category: 'noble', x: 18, y: 3, electron: '[Ne] 3s² 3p⁶', electronegativity: null, discovered: 1894 },
    // 第四周期
    { disabled: false, number: 19, symbol: 'K', name: '钾', mass: 39.098, category: 'alkali', x: 1, y: 4, electron: '[Ar] 4s¹', electronegativity: 0.82, discovered: 1807 },
    { disabled: false, number: 20, symbol: 'Ca', name: '钙', mass: 40.078, category: 'alkaline', x: 2, y: 4, electron: '[Ar] 4s²', electronegativity: 1.00, discovered: 1808 },
    { disabled: false, number: 21, symbol: 'Sc', name: '钪', mass: 44.956, category: 'transition', x: 3, y: 4, electron: '[Ar] 3d¹ 4s²', electronegativity: 1.36, discovered: 1879 },
    { disabled: false, number: 22, symbol: 'Ti', name: '钛', mass: 47.867, category: 'transition', x: 4, y: 4, electron: '[Ar] 3d² 4s²', electronegativity: 1.54, discovered: 1791 },
    { disabled: false, number: 23, symbol: 'V', name: '钒', mass: 50.942, category: 'transition', x: 5, y: 4, electron: '[Ar] 3d³ 4s²', electronegativity: 1.63, discovered: 1801 },
    { disabled: false, number: 24, symbol: 'Cr', name: '铬', mass: 51.996, category: 'transition', x: 6, y: 4, electron: '[Ar] 3d⁵ 4s¹', electronegativity: 1.66, discovered: 1797 },
    { disabled: false, number: 25, symbol: 'Mn', name: '锰', mass: 54.938, category: 'transition', x: 7, y: 4, electron: '[Ar] 3d⁵ 4s²', electronegativity: 1.55, discovered: 1774 },
    { disabled: false, number: 26, symbol: 'Fe', name: '铁', mass: 55.845, category: 'transition', x: 8, y: 4, electron: '[Ar] 3d⁶ 4s²', electronegativity: 1.83, discovered: '古代' },
    { disabled: false, number: 27, symbol: 'Co', name: '钴', mass: 58.933, category: 'transition', x: 9, y: 4, electron: '[Ar] 3d⁷ 4s²', electronegativity: 1.88, discovered: 1735 },
    { disabled: false, number: 28, symbol: 'Ni', name: '镍', mass: 58.693, category: 'transition', x: 10, y: 4, electron: '[Ar] 3d⁸ 4s²', electronegativity: 1.91, discovered: 1751 },
    { disabled: false, number: 29, symbol: 'Cu', name: '铜', mass: 63.546, category: 'transition', x: 11, y: 4, electron: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.90, discovered: '古代' },
    { disabled: false, number: 30, symbol: 'Zn', name: '锌', mass: 65.38, category: 'transition', x: 12, y: 4, electron: '[Ar] 3d¹⁰ 4s²', electronegativity: 1.65, discovered: 1746 },
    { disabled: false, number: 31, symbol: 'Ga', name: '镓', mass: 69.723, category: 'basic-metal', x: 13, y: 4, electron: '[Ar] 3d¹⁰ 4s² 4p¹', electronegativity: 1.81, discovered: 1875 },
    { disabled: false, number: 32, symbol: 'Ge', name: '锗', mass: 72.630, category: 'semimetal', x: 14, y: 4, electron: '[Ar] 3d¹⁰ 4s² 4p²', electronegativity: 2.01, discovered: 1886 },
    { disabled: false, number: 33, symbol: 'As', name: '砷', mass: 74.922, category: 'semimetal', x: 15, y: 4, electron: '[Ar] 3d¹⁰ 4s² 4p³', electronegativity: 2.18, discovered: '古代' },
    { disabled: false, number: 34, symbol: 'Se', name: '硒', mass: 78.971, category: 'nonmetal', x: 16, y: 4, electron: '[Ar] 3d¹⁰ 4s² 4p⁴', electronegativity: 2.55, discovered: 1817 },
    { disabled: false, number: 35, symbol: 'Br', name: '溴', mass: 79.904, category: 'halogen', x: 17, y: 4, electron: '[Ar] 3d¹⁰ 4s² 4p⁵', electronegativity: 2.96, discovered: 1826 },
    { disabled: false, number: 36, symbol: 'Kr', name: '氪', mass: 83.798, category: 'noble', x: 18, y: 4, electron: '[Ar] 3d¹⁰ 4s² 4p⁶', electronegativity: 3.00, discovered: 1898 },
    // 第五周期
    { disabled: false, number: 37, symbol: 'Rb', name: '铷', mass: 85.468, category: 'alkali', x: 1, y: 5, electron: '[Kr] 5s¹', electronegativity: 0.82, discovered: 1861 },
    { disabled: false, number: 38, symbol: 'Sr', name: '锶', mass: 87.62, category: 'alkaline', x: 2, y: 5, electron: '[Kr] 5s²', electronegativity: 0.95, discovered: 1790 },
    { disabled: false, number: 39, symbol: 'Y', name: '钇', mass: 88.906, category: 'transition', x: 3, y: 5, electron: '[Kr] 4d¹ 5s²', electronegativity: 1.22, discovered: 1794 },
    { disabled: false, number: 40, symbol: 'Zr', name: '锆', mass: 91.224, category: 'transition', x: 4, y: 5, electron: '[Kr] 4d² 5s²', electronegativity: 1.33, discovered: 1789 },
    { disabled: false, number: 41, symbol: 'Nb', name: '铌', mass: 92.906, category: 'transition', x: 5, y: 5, electron: '[Kr] 4d⁴ 5s¹', electronegativity: 1.6, discovered: 1801 },
    { disabled: false, number: 42, symbol: 'Mo', name: '钼', mass: 95.95, category: 'transition', x: 6, y: 5, electron: '[Kr] 4d⁵ 5s¹', electronegativity: 2.16, discovered: 1778 },
    { disabled: false, number: 43, symbol: 'Tc', name: '锝', mass: 98, category: 'transition', x: 7, y: 5, electron: '[Kr] 4d⁵ 5s²', electronegativity: 1.9, discovered: 1937 },
    { disabled: false, number: 44, symbol: 'Ru', name: '钌', mass: 101.07, category: 'transition', x: 8, y: 5, electron: '[Kr] 4d⁷ 5s¹', electronegativity: 2.2, discovered: 1844 },
    { disabled: false, number: 45, symbol: 'Rh', name: '铑', mass: 102.91, category: 'transition', x: 9, y: 5, electron: '[Kr] 4d⁸ 5s¹', electronegativity: 2.28, discovered: 1803 },
    { disabled: false, number: 46, symbol: 'Pd', name: '钯', mass: 106.42, category: 'transition', x: 10, y: 5, electron: '[Kr] 4d¹⁰', electronegativity: 2.20, discovered: 1803 },
    { disabled: false, number: 47, symbol: 'Ag', name: '银', mass: 107.87, category: 'transition', x: 11, y: 5, electron: '[Kr] 4d¹⁰ 5s¹', electronegativity: 1.93, discovered: '古代' },
    { disabled: false, number: 48, symbol: 'Cd', name: '镉', mass: 112.41, category: 'transition', x: 12, y: 5, electron: '[Kr] 4d¹⁰ 5s²', electronegativity: 1.69, discovered: 1817 },
    { disabled: false, number: 49, symbol: 'In', name: '铟', mass: 114.82, category: 'basic-metal', x: 13, y: 5, electron: '[Kr] 4d¹⁰ 5s² 5p¹', electronegativity: 1.78, discovered: 1863 },
    { disabled: false, number: 50, symbol: 'Sn', name: '锡', mass: 118.71, category: 'basic-metal', x: 14, y: 5, electron: '[Kr] 4d¹⁰ 5s² 5p²', electronegativity: 1.96, discovered: '古代' },
    { disabled: false, number: 51, symbol: 'Sb', name: '锑', mass: 121.76, category: 'semimetal', x: 15, y: 5, electron: '[Kr] 4d¹⁰ 5s² 5p³', electronegativity: 2.05, discovered: '古代' },
    { disabled: false, number: 52, symbol: 'Te', name: '碲', mass: 127.60, category: 'semimetal', x: 16, y: 5, electron: '[Kr] 4d¹⁰ 5s² 5p⁴', electronegativity: 2.1, discovered: 1782 },
    { disabled: false, number: 53, symbol: 'I', name: '碘', mass: 126.90, category: 'halogen', x: 17, y: 5, electron: '[Kr] 4d¹⁰ 5s² 5p⁵', electronegativity: 2.66, discovered: 1811 },
    { disabled: false, number: 54, symbol: 'Xe', name: '氙', mass: 131.29, category: 'noble', x: 18, y: 5, electron: '[Kr] 4d¹⁰ 5s² 5p⁶', electronegativity: 2.6, discovered: 1898 },
    // 第六周期
    { disabled: false, number: 55, symbol: 'Cs', name: '铯', mass: 132.91, category: 'alkali', x: 1, y: 6, electron: '[Xe] 6s¹', electronegativity: 0.79, discovered: 1860 },
    { disabled: false, number: 56, symbol: 'Ba', name: '钡', mass: 137.33, category: 'alkaline', x: 2, y: 6, electron: '[Xe] 6s²', electronegativity: 0.89, discovered: 1808 },
    // 镧系元素
    { disabled: false, number: 57, symbol: 'La', name: '镧', mass: 138.91, category: 'lanthanide', x: 3, y: 8, electron: '[Xe] 5d¹ 6s²', electronegativity: 1.1, discovered: 1839 },
    { disabled: false, number: 58, symbol: 'Ce', name: '铈', mass: 140.12, category: 'lanthanide', x: 4, y: 8, electron: '[Xe] 4f¹ 5d¹ 6s²', electronegativity: 1.12, discovered: 1803 },
    { disabled: false, number: 59, symbol: 'Pr', name: '镨', mass: 140.91, category: 'lanthanide', x: 5, y: 8, electron: '[Xe] 4f³ 6s²', electronegativity: 1.13, discovered: 1885 },
    { disabled: false, number: 60, symbol: 'Nd', name: '钕', mass: 144.24, category: 'lanthanide', x: 6, y: 8, electron: '[Xe] 4f⁴ 6s²', electronegativity: 1.14, discovered: 1885 },
    { disabled: false, number: 61, symbol: 'Pm', name: '钷', mass: 145, category: 'lanthanide', x: 7, y: 8, electron: '[Xe] 4f⁵ 6s²', electronegativity: 1.13, discovered: 1945 },
    { disabled: false, number: 62, symbol: 'Sm', name: '钐', mass: 150.36, category: 'lanthanide', x: 8, y: 8, electron: '[Xe] 4f⁶ 6s²', electronegativity: 1.17, discovered: 1879 },
    { disabled: false, number: 63, symbol: 'Eu', name: '铕', mass: 151.96, category: 'lanthanide', x: 9, y: 8, electron: '[Xe] 4f⁷ 6s²', electronegativity: 1.2, discovered: 1901 },
    { disabled: false, number: 64, symbol: 'Gd', name: '钆', mass: 157.25, category: 'lanthanide', x: 10, y: 8, electron: '[Xe] 4f⁷ 5d¹ 6s²', electronegativity: 1.2, discovered: 1880 },
    { disabled: false, number: 65, symbol: 'Tb', name: '铽', mass: 158.93, category: 'lanthanide', x: 11, y: 8, electron: '[Xe] 4f⁹ 6s²', electronegativity: 1.2, discovered: 1843 },
    { disabled: false, number: 66, symbol: 'Dy', name: '镝', mass: 162.50, category: 'lanthanide', x: 12, y: 8, electron: '[Xe] 4f¹⁰ 6s²', electronegativity: 1.22, discovered: 1886 },
    { disabled: false, number: 67, symbol: 'Ho', name: '钬', mass: 164.93, category: 'lanthanide', x: 13, y: 8, electron: '[Xe] 4f¹¹ 6s²', electronegativity: 1.23, discovered: 1878 },
    { disabled: false, number: 68, symbol: 'Er', name: '铒', mass: 167.26, category: 'lanthanide', x: 14, y: 8, electron: '[Xe] 4f¹² 6s²', electronegativity: 1.24, discovered: 1843 },
    { disabled: false, number: 69, symbol: 'Tm', name: '铥', mass: 168.93, category: 'lanthanide', x: 15, y: 8, electron: '[Xe] 4f¹³ 6s²', electronegativity: 1.25, discovered: 1879 },
    { disabled: false, number: 70, symbol: 'Yb', name: '镱', mass: 173.05, category: 'lanthanide', x: 16, y: 8, electron: '[Xe] 4f¹⁴ 6s²', electronegativity: 1.1, discovered: 1878 },
    { disabled: false, number: 71, symbol: 'Lu', name: '镥', mass: 174.97, category: 'lanthanide', x: 17, y: 8, electron: '[Xe] 4f¹⁴ 5d¹ 6s²', electronegativity: 1.27, discovered: 1907 },
    // 第六周期继续
    { disabled: false, number: 72, symbol: 'Hf', name: '铪', mass: 178.49, category: 'transition', x: 4, y: 6, electron: '[Xe] 4f¹⁴ 5d² 6s²', electronegativity: 1.3, discovered: 1923 },
    { disabled: false, number: 73, symbol: 'Ta', name: '钽', mass: 180.95, category: 'transition', x: 5, y: 6, electron: '[Xe] 4f¹⁴ 5d³ 6s²', electronegativity: 1.5, discovered: 1802 },
    { disabled: false, number: 74, symbol: 'W', name: '钨', mass: 183.84, category: 'transition', x: 6, y: 6, electron: '[Xe] 4f¹⁴ 5d⁴ 6s²', electronegativity: 2.36, discovered: 1783 },
    { disabled: false, number: 75, symbol: 'Re', name: '铼', mass: 186.21, category: 'transition', x: 7, y: 6, electron: '[Xe] 4f¹⁴ 5d⁵ 6s²', electronegativity: 1.9, discovered: 1925 },
    { disabled: false, number: 76, symbol: 'Os', name: '锇', mass: 190.23, category: 'transition', x: 8, y: 6, electron: '[Xe] 4f¹⁴ 5d⁶ 6s²', electronegativity: 2.2, discovered: 1803 },
    { disabled: false, number: 77, symbol: 'Ir', name: '铱', mass: 192.22, category: 'transition', x: 9, y: 6, electron: '[Xe] 4f¹⁴ 5d⁷ 6s²', electronegativity: 2.20, discovered: 1803 },
    { disabled: false, number: 78, symbol: 'Pt', name: '铂', mass: 195.08, category: 'transition', x: 10, y: 6, electron: '[Xe] 4f¹⁴ 5d⁹ 6s¹', electronegativity: 2.28, discovered: 1735 },
    { disabled: false, number: 79, symbol: 'Au', name: '金', mass: 196.97, category: 'transition', x: 11, y: 6, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54, discovered: '古代' },
    { disabled: false, number: 80, symbol: 'Hg', name: '汞', mass: 200.59, category: 'transition', x: 12, y: 6, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', electronegativity: 2.00, discovered: '古代' },
    { disabled: false, number: 81, symbol: 'Tl', name: '铊', mass: 204.38, category: 'basic-metal', x: 13, y: 6, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', electronegativity: 1.62, discovered: 1861 },
    { disabled: false, number: 82, symbol: 'Pb', name: '铅', mass: 207.2, category: 'basic-metal', x: 14, y: 6, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronegativity: 2.33, discovered: '古代' },
    { disabled: false, number: 83, symbol: 'Bi', name: '铋', mass: 208.98, category: 'basic-metal', x: 15, y: 6, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', electronegativity: 2.02, discovered: 1753 },
    { disabled: false, number: 84, symbol: 'Po', name: '钋', mass: 209, category: 'semimetal', x: 16, y: 6, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', electronegativity: 2.0, discovered: 1898 },
    { disabled: false, number: 85, symbol: 'At', name: '砹', mass: 210, category: 'halogen', x: 17, y: 6, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', electronegativity: 2.2, discovered: 1940 },
    { disabled: false, number: 86, symbol: 'Rn', name: '氡', mass: 222, category: 'noble', x: 18, y: 6, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', electronegativity: 2.2, discovered: 1900 },
    // 第七周期
    { disabled: false, number: 87, symbol: 'Fr', name: '钫', mass: 223, category: 'alkali', x: 1, y: 7, electron: '[Rn] 7s¹', electronegativity: 0.7, discovered: 1939 },
    { disabled: false, number: 88, symbol: 'Ra', name: '镭', mass: 226, category: 'alkaline', x: 2, y: 7, electron: '[Rn] 7s²', electronegativity: 0.9, discovered: 1898 },
    // 锕系元素
    { disabled: false, number: 89, symbol: 'Ac', name: '锕', mass: 227, category: 'actinide', x: 3, y: 9, electron: '[Rn] 6d¹ 7s²', electronegativity: 1.1, discovered: 1899 },
    { disabled: false, number: 90, symbol: 'Th', name: '钍', mass: 232.04, category: 'actinide', x: 4, y: 9, electron: '[Rn] 6d² 7s²', electronegativity: 1.3, discovered: 1829 },
    { disabled: false, number: 91, symbol: 'Pa', name: '镤', mass: 231.04, category: 'actinide', x: 5, y: 9, electron: '[Rn] 5f² 6d¹ 7s²', electronegativity: 1.5, discovered: 1913 },
    { disabled: false, number: 92, symbol: 'U', name: '铀', mass: 238.03, category: 'actinide', x: 6, y: 9, electron: '[Rn] 5f³ 6d¹ 7s²', electronegativity: 1.38, discovered: 1789 },
    { disabled: false, number: 93, symbol: 'Np', name: '镎', mass: 237, category: 'actinide', x: 7, y: 9, electron: '[Rn] 5f⁴ 6d¹ 7s²', electronegativity: 1.36, discovered: 1940 },
    { disabled: false, number: 94, symbol: 'Pu', name: '钚', mass: 244, category: 'actinide', x: 8, y: 9, electron: '[Rn] 5f⁶ 7s²', electronegativity: 1.28, discovered: 1940 },
    { disabled: false, number: 95, symbol: 'Am', name: '镅', mass: 243, category: 'actinide', x: 9, y: 9, electron: '[Rn] 5f⁷ 7s²', electronegativity: 1.3, discovered: 1944 },
    { disabled: false, number: 96, symbol: 'Cm', name: '锔', mass: 247, category: 'actinide', x: 10, y: 9, electron: '[Rn] 5f⁷ 6d¹ 7s²', electronegativity: 1.3, discovered: 1944 },
    { disabled: false, number: 97, symbol: 'Bk', name: '锫', mass: 247, category: 'actinide', x: 11, y: 9, electron: '[Rn] 5f⁹ 7s²', electronegativity: 1.3, discovered: 1949 },
    { disabled: false, number: 98, symbol: 'Cf', name: '锎', mass: 251, category: 'actinide', x: 12, y: 9, electron: '[Rn] 5f¹⁰ 7s²', electronegativity: 1.3, discovered: 1950 },
    { disabled: false, number: 99, symbol: 'Es', name: '锿', mass: 252, category: 'actinide', x: 13, y: 9, electron: '[Rn] 5f¹¹ 7s²', electronegativity: 1.3, discovered: 1952 },
    { disabled: false, number: 100, symbol: 'Fm', name: '镄', mass: 257, category: 'actinide', x: 14, y: 9, electron: '[Rn] 5f¹² 7s²', electronegativity: 1.3, discovered: 1952 },
    { disabled: false, number: 101, symbol: 'Md', name: '钔', mass: 258, category: 'actinide', x: 15, y: 9, electron: '[Rn] 5f¹³ 7s²', electronegativity: 1.3, discovered: 1955 },
    { disabled: false, number: 102, symbol: 'No', name: '锘', mass: 259, category: 'actinide', x: 16, y: 9, electron: '[Rn] 5f¹⁴ 7s²', electronegativity: 1.3, discovered: 1958 },
    { disabled: false, number: 103, symbol: 'Lr', name: '铹', mass: 266, category: 'actinide', x: 17, y: 9, electron: '[Rn] 5f¹⁴ 7s² 7p¹', electronegativity: 1.3, discovered: 1961 },
    // 第七周期继续
    { disabled: false, number: 104, symbol: 'Rf', name: '卢瑟福ium', mass: 267, category: 'transition', x: 4, y: 7, electron: '[Rn] 5f¹⁴ 6d² 7s²', electronegativity: null, discovered: 1964 },
    { disabled: false, number: 105, symbol: 'Db', name: '𬭊', mass: 268, category: 'transition', x: 5, y: 7, electron: '[Rn] 5f¹⁴ 6d³ 7s²', electronegativity: null, discovered: 1967 },
    { disabled: false, number: 106, symbol: 'Sg', name: '𬭳', mass: 269, category: 'transition', x: 6, y: 7, electron: '[Rn] 5f¹⁴ 6d⁴ 7s²', electronegativity: null, discovered: 1974 },
    { disabled: false, number: 107, symbol: 'Bh', name: '𬭛', mass: 270, category: 'transition', x: 7, y: 7, electron: '[Rn] 5f¹⁴ 6d⁵ 7s²', electronegativity: null, discovered: 1981 },
    { disabled: false, number: 108, symbol: 'Hs', name: '𬭶', mass: 277, category: 'transition', x: 8, y: 7, electron: '[Rn] 5f¹⁴ 6d⁶ 7s²', electronegativity: null, discovered: 1984 },
    { disabled: false, number: 109, symbol: 'Mt', name: '鿏', mass: 278, category: 'transition', x: 9, y: 7, electron: '[Rn] 5f¹⁴ 6d⁷ 7s²', electronegativity: null, discovered: 1982 },
    { disabled: false, number: 110, symbol: 'Ds', name: '𫟼', mass: 281, category: 'transition', x: 10, y: 7, electron: '[Rn] 5f¹⁴ 6d⁹ 7s¹', electronegativity: null, discovered: 1994 },
    { disabled: false, number: 111, symbol: 'Rg', name: '𬬭', mass: 282, category: 'transition', x: 11, y: 7, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s¹', electronegativity: null, discovered: 1994 },
    { disabled: false, number: 112, symbol: 'Cn', name: '鎶', mass: 285, category: 'transition', x: 12, y: 7, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', electronegativity: null, discovered: 1996 },
    { disabled: false, number: 113, symbol: 'Nh', name: '鉨', mass: 286, category: 'basic-metal', x: 13, y: 7, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', electronegativity: null, discovered: 2003 },
    { disabled: false, number: 114, symbol: 'Fl', name: '鈇', mass: 289, category: 'basic-metal', x: 14, y: 7, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', electronegativity: null, discovered: 1998 },
    { disabled: false, number: 115, symbol: 'Mc', name: '镆', mass: 290, category: 'basic-metal', x: 15, y: 7, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', electronegativity: null, discovered: 2003 },
    { disabled: false, number: 116, symbol: 'Lv', name: '鉝', mass: 293, category: 'basic-metal', x: 16, y: 7, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', electronegativity: null, discovered: 2000 },
    { disabled: false, number: 117, symbol: 'Ts', name: '鿬', mass: 294, category: 'halogen', x: 17, y: 7, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', electronegativity: null, discovered: 2010 },
    { disabled: false, number: 118, symbol: 'Og', name: '鿫', mass: 294, category: 'noble', x: 18, y: 7, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', electronegativity: null, discovered: 2002 }
]);

const props = defineProps(['data'])
const emit = defineEmits(['updatePeriodic'])
const show_periodic_table = ref(false)
const selectedElement = ref(null)
const selectedElementList = ref([])

function initPeriodic() {
  const disabledList_1 = props.data.needElement.split(',')
  const disabledList_2 = props.data.noCheck.split(',')
  const disabledList = [...disabledList_1, ...disabledList_2]
  elements.value.forEach(item => {
    item.disabled = disabledList.includes(item.symbol)
  })
}
initPeriodic()

//控制弹框开启、关闭
function showPeriodicTable(value) {
  show_periodic_table.value = value
  if(props.data.fieIdValue) {
    selectedElementList.value = [...props.data.fieIdValue.split(',')]
  }
}

// 选择元素
const selectElement = (element) => {
    if(element.disabled) return
    selectedElement.value = element;
    const index = selectedElementList.value.findIndex(item => item == element.symbol)
    if(index < 0 && (selectedElementList.value.length < props.data.maxElement || props.data.maxElement == 0)) {
      selectedElementList.value.push(element.symbol)
    }
    if(index >= 0) {
      selectedElementList.value.splice(index, 1)
    }
    emit('updatePeriodic', selectedElementList.value)
};

// 检查位置是否为空
const isEmptyPosition = (x, y) => {
    return !elements.value.some(el => el.x === x && el.y === y);
};

// 获取指定位置的元素
const getElementAtPosition = (x, y) => {
    return elements.value.find(el => el.x === x && el.y === y);
};

defineExpose({
  showPeriodicTable
})
</script>

<template>
  <el-dialog style="width: 80vw; min-width: 1000px !important;" v-model="show_periodic_table" align-center>
    <div class="element-list">
      <span>至少选择</span>
      <span class="font-FF4A2B">1</span>
      <span>个元素，</span>
      <span v-if="props.data.maxElement">
        <span>最多选择</span>
        <span class="font-FF4A2B">{{ props.data.maxElement }}</span>
        <span>个元素，</span>
      </span>
      <span>您已选择:共</span>
      <span class="font-5CC300">{{selectedElementList.length}}</span>
      <span>个元素</span>
      <span v-if="selectedElementList.length">--【{{ selectedElementList.join(',') }}】</span>
      <el-button style="margin-left: 10px;" size="small" type="success" plain @click="show_periodic_table = false">确认</el-button>
    </div>
    <div class="container">
        <div class="periodic-table">
            <template v-for="y in 9">
                <template v-for="x in 18">
                    <div 
                      v-if="isEmptyPosition(x, y)" 
                      :key="'empty-' + x + '-' + y" 
                      class="element empty"
                    ></div>
                    <div 
                      v-else
                      :key="x + '-' + y"
                      class="element"
                      :class="{
                        ['category-' + getElementAtPosition(x, y).category]: true,
                        'element-active': selectedElementList.includes(getElementAtPosition(x, y).symbol),
                        'element-disabled': getElementAtPosition(x, y).disabled,
                      }"
                      @click="selectElement(getElementAtPosition(x, y))"
                    >
                        <div class="number">{{ getElementAtPosition(x, y).number }}</div>
                        <div class="symbol">{{ getElementAtPosition(x, y).symbol }}</div>
                        <div class="name">{{ getElementAtPosition(x, y).name }}</div>
                        <div class="mass">{{ getElementAtPosition(x, y).mass.toFixed(2) }}</div>
                    </div>
                </template>
            </template>
        </div>
          
        <div v-if="selectedElement" class="element-detail">
            <h2>
                <span class="detail-symbol" :class="'category-' + selectedElement.category">{{ selectedElement.symbol }}</span>
                {{ selectedElement.name }} ({{ selectedElement.number }})
            </h2>
            <div class="detail-properties">
                <div class="flex-center properties-item">
                    <div>{{ selectedElement.mass.toFixed(4) }}</div>
                    <div><strong>原子量</strong></div>
                </div>
                <div class="flex-center properties-item">
                    <div>{{ selectedElement.electron }}</div>
                    <div><strong>电子排布</strong></div>
                </div>
                <div class="flex-center properties-item">
                    <div>{{ selectedElement.electronegativity || '未知' }}</div>
                    <div><strong>电负性</strong></div>
                </div>
                <div class="flex-center properties-item">
                    <div>{{ selectedElement.discovered }}</div>
                    <div><strong>发现年份</strong></div>
                </div>
            </div>
        </div>
    </div>
  </el-dialog>
    
</template>

<style lang="scss" scoped>
  * {
    font-family: 'Arial', sans-serif;
  }
  .container {
    position: relative;
    min-width: 800px;
  }
  .element-list {
    width: 100%;
    margin: 15px 0;
    text-align: center;
  }
  .periodic-table {
    display: grid;
    grid-template-columns: repeat(18, 1fr);
    gap: 4px;
    margin: 0 auto;
    min-width: 800px;
  }
  .element {
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 60px;
  }
  .element:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 10;
  }
  .element-active {
    background-color: #4D6FFE !important;
  }
  .element-disabled {
    background-color: #CCCCCC !important;
  }
  .number {
    text-align: left;
    position: absolute;
    top: 4px;
    left: 4px;
  }
  .symbol {
    font-weight: bold;
    margin-top: 12px;
  }
  .name {
    margin-top: 4px;
  }
  .mass {
    margin-top: 2px;
  }
  .empty {
    visibility: hidden;
  }
  .element-detail {
    position: absolute;
    top: 5%;
    left: 25%;
    width: 30%;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0px 0px 8px 2px rgba(0,0,0,0.1);
  }
  .element-detail h2 {
    color: #2c3e50;
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  .detail-symbol {
    font-weight: bold;
    background-color: #eee;
    padding: 5px 10px;
    border-radius: 4px;
  }
  .detail-properties {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    .properties-item {
      flex-direction: column;
    }
  }
  .category-alkali { background-color: #f8a7a7; }
  .category-alkaline { background-color: #f8f0a7; }
  .category-transition { background-color: #a7c7f8; }
  .category-basic-metal { background-color: #d2a7f8; }
  .category-semimetal { background-color: #a7f8d7; }
  .category-nonmetal { background-color: #a7f8a7; }
  .category-halogen { background-color: #f8d2a7; }
  .category-noble { background-color: #f8a7f0; }
  .category-lanthanide { background-color: #a7e6f8; }
  .category-actinide { background-color: #f8a7c7; }
  
  @media (max-width: 768px) {
    .periodic-table {
      grid-template-columns: repeat(9, 1fr);
    }
    .element {
      padding: 4px 2px;
      min-height: 50px;
    }
    .name {
      display: none;
    }
  }
</style>