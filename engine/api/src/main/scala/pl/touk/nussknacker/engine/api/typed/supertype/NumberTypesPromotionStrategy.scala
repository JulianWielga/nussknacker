package pl.touk.nussknacker.engine.api.typed.supertype

import pl.touk.nussknacker.engine.api.typed.typing.{Typed, TypingResult}

import scala.collection.mutable


trait NumberTypesPromotionStrategy {

  def promote(left: Class[_], right: Class[_]): TypingResult

}

object NumberTypesPromotionStrategy {

  private val FloatingNumbers: Seq[Class[_]] = IndexedSeq(
    classOf[java.math.BigDecimal],
    classOf[java.lang.Double],
    classOf[java.lang.Float]
  )

  def isFloatingNumber(clazz: Class[_]): Boolean = FloatingNumbers.contains(clazz)

  private val DecimalNumbers: mutable.LinkedHashMap[Class[_], Class[_]] = mutable.LinkedHashMap(
    classOf[java.math.BigInteger] -> classOf[java.math.BigInteger],
    classOf[java.lang.Long] -> classOf[java.lang.Long],
    classOf[java.lang.Integer] -> classOf[java.lang.Integer],
    classOf[java.lang.Short] -> classOf[java.lang.Integer],
    classOf[java.lang.Byte] -> classOf[java.lang.Integer]
  )

  private val DecimalNumbersKeys = DecimalNumbers.keys.toIndexedSeq

  val AllDecimalClasses: Set[Class[_]] = DecimalNumbers.keySet.toSet

  def isDecimalNumber(clazz: Class[_]): Boolean = AllDecimalClasses.contains(clazz)

  // See org.springframework.expression.spel.ast.OpPlus and so on for details
  object ToCommonWidestType extends NumberTypesPromotionStrategy {

    override def promote(left: Class[_], right: Class[_]): TypingResult = {
      val both = List(left, right)
      if (both.forall(FloatingNumbers.contains)) {
        Typed(both.map(n => FloatingNumbers.indexOf(n) -> n).sortBy(_._1).map(_._2).head)
      } else if (both.forall(DecimalNumbers.contains)) {
        Typed(both.map(n => DecimalNumbersKeys.indexOf(n) -> DecimalNumbers(n)).sortBy(_._1).map(_._2).head)
      } else if (both.exists(DecimalNumbers.contains) && both.exists(FloatingNumbers.contains)) {
        Typed(both.find(FloatingNumbers.contains).get)
      } else { // unknown Number
        Typed[java.lang.Double]
      }
    }

  }

  object ToSupertype extends NumberTypesPromotionStrategy {

    override def promote(left: Class[_], right: Class[_]): TypingResult = {
      if (left.isAssignableFrom(right)) {
        Typed(left)
      } else if (right.isAssignableFrom(left)) {
        Typed(right)
      } else {
        Typed[Number]
      }
    }

  }

  // See org.springframework.expression.spel.ast.OperatorPower for details
  object ForPowerOperation extends NumberTypesPromotionStrategy {

    override def promote(left: Class[_], right: Class[_]): TypingResult = {
      if (left == classOf[java.math.BigDecimal]) {
        Typed[java.math.BigDecimal]
      } else if (left == classOf[java.math.BigInteger]) {
        Typed[java.math.BigInteger]
      } else if (left == classOf[java.lang.Double] || right == classOf[java.lang.Double] ||
        left == classOf[java.lang.Float] || right == classOf[java.lang.Float]) {
        Typed[java.lang.Double]
      } else if (left == classOf[java.lang.Long] || right == classOf[java.lang.Long]) {
        Typed[java.lang.Long]
      } else {
        Typed(Typed[java.lang.Integer], Typed[java.lang.Long])  // it depends if there was overflow or not
      }
    }

  }

}
