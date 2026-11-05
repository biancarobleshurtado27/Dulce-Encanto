import React from 'react';
import {CakeSlice,Tag,Store,Archive,ReceiptText,Users,Contact,Wallet,ClipboardList,BookOpen,Wheat,Truck,ShoppingBag,List,Layers} from 'lucide-react';
const icons={productos:CakeSlice,categorias:Tag,sucursales:Store,inventarios:Archive,ventas:ReceiptText,clientes:Users,empleados:Contact,'metodos-pago':Wallet,'detalles-venta':ClipboardList,recetas:BookOpen,ingredientes:Wheat,proveedores:Truck,'ordenes-compra':ShoppingBag,'detalles-receta':List,'detalles-compra':Layers};
export default function EntityIcon({entity,size=18}){const Icon=icons[entity]||CakeSlice;return <Icon size={size} strokeWidth={1.6}/>;}
