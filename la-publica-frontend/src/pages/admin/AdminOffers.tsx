import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Pause,
  Play,
  Eye,
  ShoppingCart,
  TrendingDown,
  Calendar,
  Package,
  Ticket,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/PageWrapper";
import {
  getAllOffers,
  deleteOffer,
  togglePauseOffer,
  createCoupon,
  deactivateCoupon,
  activateCoupon,
  updateCoupon,
  deleteCoupon,
  type Offer,
  type CreateCouponData
} from "@/api/offers";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOffers();
  }, [activeTab]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await getAllOffers();

      if (response.success) {
        setOffers(response.offers);
      }
    } catch (error: any) {
      console.error('Error loading offers:', error);
      toast.error('Error al carregar les ofertes');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async (offerId: string) => {
    try {
      const response = await togglePauseOffer(offerId);

      if (response.success) {
        toast.success(response.message);
        loadOffers(); // Recargar lista
      }
    } catch (error: any) {
      console.error('Error toggling pause:', error);
      toast.error(error.response?.data?.message || 'Error al canviar l\'estat');
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      const response = await deleteOffer(offerId);

      if (response.success) {
        toast.success('Oferta eliminada correctament');
        loadOffers(); // Recargar lista
      }
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar l\'oferta');
    }
  };

  const getDaysRemaining = (endDate: Date | string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStockPercentage = (offer: Offer) => {
    return (offer.remainingStock / offer.stock) * 100;
  };

  // Filtrar ofertas por término de búsqueda
  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const stats = {
    total: offers.length,
    active: offers.filter(o => !o.isPaused && getDaysRemaining(o.endDate) > 0 && o.remainingStock > 0).length,
    paused: offers.filter(o => o.isPaused).length,
    expired: offers.filter(o => getDaysRemaining(o.endDate) < 0).length,
    totalViews: offers.reduce((sum, o) => sum + o.views, 0),
    totalPurchases: offers.reduce((sum, o) => sum + o.purchases, 0),
  };

  // Componente de gestión de cupones
  const CouponManagementDialog = ({ offer }: { offer: Offer }) => {
    const [open, setOpen] = useState(false);
    const [newCoupon, setNewCoupon] = useState<CreateCouponData>({
      code: '',
      discountPercentage: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
    });
    const [creating, setCreating] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
    const [editData, setEditData] = useState<CreateCouponData | null>(null);

    const handleCreateCoupon = async () => {
      try {
        setCreating(true);
        const response = await createCoupon(offer._id, newCoupon);

        if (response.success) {
          toast.success('Cupó creat correctament');
          setNewCoupon({
            code: '',
            discountPercentage: 0,
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: '',
          });
          loadOffers(); // Recargar ofertas
        }
      } catch (error: any) {
        console.error('Error creant cupó:', error);
        toast.error(error.response?.data?.message || 'Error al crear el cupó');
      } finally {
        setCreating(false);
      }
    };

    const handleDeactivateCoupon = async (code: string) => {
      try {
        const response = await deactivateCoupon(offer._id, code);

        if (response.success) {
          toast.success('Cupó desactivat correctament');
          loadOffers(); // Recargar ofertas
        }
      } catch (error: any) {
        console.error('Error desactivant cupó:', error);
        toast.error(error.response?.data?.message || 'Error al desactivar el cupó');
      }
    };

    const handleActivateCoupon = async (code: string) => {
      try {
        const response = await activateCoupon(offer._id, code);

        if (response.success) {
          toast.success('Cupó activat correctament');
          loadOffers();
        }
      } catch (error: any) {
        console.error('Error activant cupó:', error);
        toast.error(error.response?.data?.message || 'Error al activar el cupó');
      }
    };

    const handleDeleteCoupon = async (code: string) => {
      if (!confirm('Estàs segur que vols eliminar aquest cupó permanentment?')) {
        return;
      }

      try {
        const response = await deleteCoupon(offer._id, code);

        if (response.success) {
          toast.success('Cupó eliminat correctament');
          loadOffers();
        }
      } catch (error: any) {
        console.error('Error eliminant cupó:', error);
        toast.error(error.response?.data?.message || 'Error al eliminar el cupó');
      }
    };

    const startEdit = (coupon: any) => {
      setEditingCoupon(coupon.code);
      setEditData({
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        validFrom: typeof coupon.validFrom === 'string' ? coupon.validFrom : new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: typeof coupon.validUntil === 'string' ? coupon.validUntil : new Date(coupon.validUntil).toISOString().split('T')[0],
        maxUses: coupon.maxUses,
      });
    };

    const handleUpdateCoupon = async (originalCode: string) => {
      if (!editData) return;

      try {
        const response = await updateCoupon(offer._id, originalCode, editData);

        if (response.success) {
          toast.success('Cupó actualitzat correctament');
          setEditingCoupon(null);
          setEditData(null);
          loadOffers();
        }
      } catch (error: any) {
        console.error('Error actualitzant cupó:', error);
        toast.error(error.response?.data?.message || 'Error al actualitzar el cupó');
      }
    };

    const activeCoupons = offer.coupons.filter(c => c.isActive);
    const inactiveCoupons = offer.coupons.filter(c => !c.isActive);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Ticket className="h-4 w-4 mr-2" />
            Cupons ({activeCoupons.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Cupons - {offer.title}</DialogTitle>
            <DialogDescription>
              Crea i gestiona cupons de descompte per aquesta oferta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Formulario para crear cupón */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm">Crear Nou Cupó</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Codi del cupó</Label>
                  <Input
                    id="code"
                    placeholder="DESCOMPTE20"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Percentatge descompte (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={newCoupon.discountPercentage || ''}
                    onChange={(e) => setNewCoupon({...newCoupon, discountPercentage: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <Label htmlFor="validFrom">Vàlid des de</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={typeof newCoupon.validFrom === 'string' ? newCoupon.validFrom : new Date(newCoupon.validFrom).toISOString().split('T')[0]}
                    onChange={(e) => setNewCoupon({...newCoupon, validFrom: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="validUntil">Vàlid fins</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={typeof newCoupon.validUntil === 'string' ? newCoupon.validUntil : new Date(newCoupon.validUntil).toISOString().split('T')[0]}
                    onChange={(e) => setNewCoupon({...newCoupon, validUntil: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="maxUses">Usos màxims (opcional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    placeholder="Il·limitat"
                    value={newCoupon.maxUses || ''}
                    onChange={(e) => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value) || undefined})}
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateCoupon}
                disabled={creating || !newCoupon.code || !newCoupon.discountPercentage || !newCoupon.validUntil}
                className="w-full"
              >
                {creating ? 'Creant...' : 'Crear Cupó'}
              </Button>
            </div>

            {/* Cupones activos */}
            {activeCoupons.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Cupons Actius</h3>
                {activeCoupons.map((coupon) => (
                  <Card key={coupon.code} className="p-4">
                    {editingCoupon === coupon.code && editData ? (
                      // Modo edición
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Codi del cupó</Label>
                            <Input
                              value={editData.code}
                              onChange={(e) => setEditData({...editData, code: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div>
                            <Label>Percentatge descompte (%)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={editData.discountPercentage}
                              onChange={(e) => setEditData({...editData, discountPercentage: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <Label>Vàlid des de</Label>
                            <Input
                              type="date"
                              value={typeof editData.validFrom === 'string' ? editData.validFrom : new Date(editData.validFrom).toISOString().split('T')[0]}
                              onChange={(e) => setEditData({...editData, validFrom: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Vàlid fins</Label>
                            <Input
                              type="date"
                              value={typeof editData.validUntil === 'string' ? editData.validUntil : new Date(editData.validUntil).toISOString().split('T')[0]}
                              onChange={(e) => setEditData({...editData, validUntil: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Usos màxims (opcional)</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Il·limitat"
                              value={editData.maxUses || ''}
                              onChange={(e) => setEditData({...editData, maxUses: parseInt(e.target.value) || undefined})}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCoupon(coupon.code)}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCoupon(null);
                              setEditData(null);
                            }}
                          >
                            Cancel·lar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Modo visualización
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="font-mono">{coupon.code}</Badge>
                            <Badge variant="secondary">{coupon.discountPercentage}% descompte</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Vàlid: {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Usos: {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ' (il·limitat)'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(coupon)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivateCoupon(coupon.code)}
                          >
                            Desactivar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCoupon(coupon.code)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Cupones inactivos */}
            {inactiveCoupons.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-500">Cupons Desactivats</h3>
                {inactiveCoupons.map((coupon) => (
                  <Card key={coupon.code} className="p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 opacity-60">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">{coupon.code}</Badge>
                          <Badge variant="outline">{coupon.discountPercentage}% descompte</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Vàlid: {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Usos totals: {coupon.usedCount}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivateCoupon(coupon.code)}
                        >
                          Reactivar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCoupon(coupon.code)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {offer.coupons.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Encara no hi ha cupons per aquesta oferta
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Tancar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const OfferRow = ({ offer }: { offer: Offer }) => {
    const daysRemaining = getDaysRemaining(offer.endDate);
    const stockPercentage = getStockPercentage(offer);
    const isExpired = daysRemaining < 0;
    const isSoldOut = offer.remainingStock === 0;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Imagen */}
            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getImageUrl(offer.mainImage)}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-red-500 text-white font-bold">
                  -{offer.discountPercentage}%
                </Badge>
              </div>
            </div>

            {/* Información */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Link
                    to={`/ofertes/${offer.slug}`}
                    className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                  >
                    {offer.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{offer.company?.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {offer.description}
                  </p>
                </div>

                {/* Badges de estado */}
                <div className="flex flex-col gap-1 ml-4">
                  {offer.isPaused && (
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                      Pausada
                    </Badge>
                  )}
                  {isSoldOut && (
                    <Badge variant="destructive">
                      Esgotat
                    </Badge>
                  )}
                  {isExpired && (
                    <Badge variant="secondary" className="bg-gray-500 text-white">
                      Caducada
                    </Badge>
                  )}
                  {!offer.isPaused && !isSoldOut && !isExpired && (
                    <Badge className="bg-green-500 text-white">
                      Activa
                    </Badge>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-semibold text-lg text-primary">
                      {offer.discountedPrice.toFixed(2)}€
                    </p>
                    <p className="text-xs text-gray-500 line-through">
                      {offer.originalPrice.toFixed(2)}€
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-semibold">{offer.views}</p>
                    <p className="text-xs text-gray-500">Vistes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <ShoppingCart className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-semibold">{offer.purchases}</p>
                    <p className="text-xs text-gray-500">Vendes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-semibold">{offer.remainingStock}/{offer.stock}</p>
                    <p className="text-xs text-gray-500">Places</p>
                  </div>
                </div>
              </div>

              {/* Barra de stock */}
              {!isSoldOut && (
                <div className="mt-3">
                  <Progress value={stockPercentage} className="h-2" />
                </div>
              )}

              {/* Información de fechas */}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(offer.startDate).toLocaleDateString('ca-ES')} - {new Date(offer.endDate).toLocaleDateString('ca-ES')}
                  </span>
                </div>
                {daysRemaining > 0 && (
                  <div className="flex items-center gap-1">
                    <span className={daysRemaining <= 7 ? 'text-orange-600 font-semibold' : ''}>
                      {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dies'} restants
                    </span>
                  </div>
                )}
                {offer.coupons.filter(c => c.isActive).length > 0 && (
                  <div className="flex items-center gap-1">
                    <Ticket className="h-4 w-4" />
                    <span>{offer.coupons.filter(c => c.isActive).length} cupons actius</span>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/ofertes/${offer.slug}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Veure
                </Link>
              </Button>

              <Button size="sm" variant="outline" asChild>
                <Link to={`/admin/ofertes/${offer._id}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>

              <CouponManagementDialog offer={offer} />

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTogglePause(offer._id)}
                disabled={isExpired || isSoldOut}
              >
                {offer.isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activar
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Estàs segur?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Aquesta acció no es pot desfer. L'oferta s'eliminarà permanentment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(offer._id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestió d'Ofertes Promocionals</h1>
            <p className="text-gray-600">Administra totes les ofertes de la plataforma</p>
          </div>
          <Button asChild>
            <Link to="/admin/ofertes/crear">
              <Plus className="h-4 w-4 mr-2" />
              Crear Nova Oferta
            </Link>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Actives</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Pause className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Pausades</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Caducades</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Vistes totals</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">Vendes totals</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.totalPurchases}</p>
            </CardContent>
          </Card>
        </div>

        {/* Buscar */}
        <div className="w-full max-w-md">
          <Input
            type="text"
            placeholder="Cercar per títol o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Tabs y Lista */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Totes ({stats.total})</TabsTrigger>
            <TabsTrigger value="active">Actives ({stats.active})</TabsTrigger>
            <TabsTrigger value="paused">Pausades ({stats.paused})</TabsTrigger>
            <TabsTrigger value="expired">Caducades ({stats.expired})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => <OfferRow key={offer._id} offer={offer} />)
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Tag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No s\'han trobat ofertes' : `No hi ha ofertes ${activeTab !== 'all' && activeTab}`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Prova amb un altre terme de cerca' : 'Crea la primera oferta promocional per començar'}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link to="/admin/ofertes/crear">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Oferta
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
